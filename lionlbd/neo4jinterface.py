from __future__ import absolute_import

from py2neo import authenticate, Graph
import config
import ujson
import logging
from logging import info, debug


from lionlbd.lbdinterface import LbdInterface, LbdFilters

logging.basicConfig(level=logging.WARN)

from ast import literal_eval as make_tuple

RESULTS_PER_PAGE_NODE = 15


class Neo4jInterface(LbdInterface):

    def __init__(self):
        authenticate("localhost:7474", config.NEO4J_USERNAME, config.NEO4J_PASSWORD)
        self._graph = Graph()
        self._entity_types=None
        self._metricsMap=None
        self._aggregation_funcs = ["min","avg","max"]
        self._metaInfo=None
        self._metricRangeMap = None
        self._sentByYears=None
        self._yearRange=None


    def neighbours(self, id_, metric, year=None, filters=None, limit=None,
                   offset=0, exclude_neighbours_of=None):
        """Return neighbours of node with given ID.

        Ranks neighbours by the values of the given metric on the
        connecting edges.

        Args:
            id_ (str): ID of node whose neighbours to return.
            metric (str): Name of metric to use for ranking. Must be one
                of the values returned by get_metrics().
            year (int): The "current" year for purposes of the search, or
                None for the most recent year. Must be within the range
                returned by get_year_range().
            filters (LbdFilters): The filters to apply, or None for no
                filtering.
            limit (int): Maximum number of items to return, or None for
                no limit.
            offset (int): Offset of first item in ranked list to return.
                Used together with limit for paging.
            exclude_neighbours_of (str) ID of node whose neighbours to
                exclude from results, or None to include all.

        Raises:
            ValueError if any argument has an inappropriate value.

        Returns:
             Pair of sequences: (IDs, scores).
        """
        if year is None: year = self.max_year()

        self._validate_metric(metric)
        self._validate_year(year)
        self._validate_limit(limit)
        self._validate_offset(offset)
        self._validate_filters(filters)

        limit = "LIMIT {0}".format(limit) if not limit is None else ""
        offset = "SKIP {0}".format(offset) if not offset==0 else ""

        where_constraints = []

        filter_str = self._filter_edge_weight_string(filters, ["e1"], metric, year)
        if filter_str: where_constraints.append(filter_str)

        if exclude_neighbours_of:
            where_constraints.append("NOT (n2 IN excluded_nodes)")
            where_clause = " AND ".join(where_constraints).strip()
            if where_clause: where_clause = "WHERE " + where_clause
            q= """MATCH (n3{{OID:\"{pivot_id}\"}})-[e2]-(n4) WITH COLLECT(n4) AS excluded_nodes
            MATCH (n1{{OID:\"{id}\"}})-[e1]-(n2) WITH excluded_nodes, n1, e1, n2 {where}
            RETURN n2.OID as id, {metric} as score ORDER BY score DESC {offset} {limit}""".format(
            pivot_id=exclude_neighbours_of, id=id_,
            where=where_clause,  metric=self._metric_str(metric,year,e="e1"), offset=offset, limit=limit)
        else:
            where_clause = "AND ".join(where_constraints).strip()
            if where_clause: where_clause = "WHERE " + where_clause
            q = "Match (n1{{OID:\"{id}\"}})-[e1]-(n2) {where} RETURN n2.OID as id, {metric} as score ORDER BY score DESC {offset} {limit}".format(
            id=id_, where=where_clause, metric=self._metric_str(metric,year,e="e1"), offset=offset, limit=limit)

        debug(q)
        info(q)
        results = self._graph.data(q)
        debug(results)
        return [res["id"] for res in results], [res["score"] for res in results]


    def closed_discovery(self, a_id, c_id, metric, agg_func, year=None,
                         filters=None, limit=None, offset=0):
        """Return common neighbours of nodes with given IDs.

        Ranks common neighbours by the values of the given metric,
        aggregated by the specified function into a score for the
        path.

        Args:
            a_id (str): ID of the "start" node for the search.
            c_id (str): ID of the "end" node for the search.
            metric (str): Name of metric to use for ranking. Must be one
                of the values returned by get_metrics().
            agg_func (str): Name of the function to use to combine metric
                values over a path. Must be one of the values returned
                by get_aggregation_functions().
            year (int): The "current" year for purposes of the search, or
                None for the most recent year. Must be within the range
                returned by get_year_range().
            filters (LbdFilters): The filters to apply, or None for no
                filtering.
            limit (int): Maximum number of items to return, or None for
                no limit.
            offset (int): Offset of first item in ranked list to return.
                Used together with limit for paging.

        Raises:
            ValueError if any argument has an inappropriate value.

        Returns:
             Pair of sequences: (IDs, scores).

        """
        if year is None: year = self.max_year()
        self._validate_metric(metric)
        self._validate_aggregation_function(agg_func)
        self._validate_year(year)
        self._validate_filters(filters)
        self._validate_limit(limit)
        self._validate_offset(offset)
        # if return_format = None
        compListStr = "[{0}, {1}]".format(self._metric_str(metric, year, e="e1"),
                                          self._metric_str(metric, year, e="e2"))

        node_filter_str = self._filter_nodes_string(filters, ["b"])
        edge_filter_str = self._filter_edge_weight_string(filters, ["e1", "e2"], metric, year)

        where_constraints = []

        if node_filter_str: where_constraints.append(node_filter_str)
        if edge_filter_str: where_constraints.append(edge_filter_str)
        if year < self.max_year(): where_constraints.append("e1.year <= {year} AND e2.year <= {year}".format(year=year))
        where_clause = "AND ".join(where_constraints)
        if where_clause: where_clause = "WHERE " + where_clause
        limit = "LIMIT {0}".format(limit) if not limit is None else ""
        offset = "SKIP {0}".format(offset) if not offset == 0 else ""

        c_id = "{{OID:\"{0}\"}}".format(c_id)
        collect_str = "{{ID:b.OID, compList:{0}}}".format(compListStr)



        q = """MATCH (a{{OID:\"{A}\"}})-[e1]-(b)-[e2]-(c{C}) {where} WITH collect({collect_str}) as rows\n""".format(
            A=a_id, C=c_id, where=where_clause,collect_str=collect_str)

        q += """UNWIND rows as row
           WITH row.ID as id, row.compList as compList
           UNWIND compList as compRows
           RETURN id, {agg_func}(compRows) as score ORDER BY score DESC {offset} {limit};""".format(
            agg_func=agg_func, offset=offset, limit=limit)

        debug(q)
        results = self._graph.data(q)
        return [res["id"] for res in results], [res["score"] for res in results]


    def _discovery_query(self, OID_A, metric, agg_func, year, filters, OID_C="", limit=None, offset=0):
        # if return_format = None
        compListStr = "[{0}, {1}]".format(self._metric_str(metric,year, e="e1"),self._metric_str(metric,year, e="e2"))

        node_filter_str = self._filter_nodes_string(filters,["b"],["c"])
        edge_filter_str = self._filter_edge_weight_string(filters,["e1","e2"],metric,year)

        if node_filter_str: node_filter_str = "AND {0}".format(node_filter_str)
        if edge_filter_str: edge_filter_str = "AND {0}".format(edge_filter_str)

        limit = "LIMIT {0}".format(limit) if not limit is None else ""
        offset = "SKIP {0}".format(offset) if not offset ==0 else ""

        if OID_C:
            OID_C= "{{OID:\"{0}\"}}".format(OID_C)
            collect_str = "{{ID:c.OID, compList:{0}}}".format(compListStr)
        else:
            collect_str = "{{ID:b.OID, compList:{0}}}".format(compListStr)

        q = """MATCH (a{{OID:\"{A}\"}})-[e1]-(b)-[e2]-(c{C}) WHERE e1.year <= {year} AND e2.year <= {year} AND NOT (a)--(c)
        {nodes_filter} {edge_filter}
        WITH collect({collect_str}) as rows\n""".format(
            A=OID_A, C=OID_C, year=year, nodes_filter=node_filter_str, edge_filter=edge_filter_str, collect_str=collect_str)

        if year < self.max_year():
            q += """MATCH (a{{OID:\"{A}\"}})-[e1]-(b)-[e2]-(c{C})-[e3]-(a) WHERE e1.year <= {year} AND e2.year <= {year} AND e3.year > {year}
        {nodes_filter} {edge_filter}
        WITH rows + collect({collect_str}) as rows\n""".format(
            A=OID_A, C=OID_C, year=year, nodes_filter=node_filter_str, edge_filter=edge_filter_str, collect_str=collect_str)

        q += """UNWIND rows as row
        WITH row.ID as id, row.compList as compList
        UNWIND compList as compRows
        RETURN id, {agg_func}(compRows) as score ORDER BY score DESC {offset} {limit};""".format(
            agg_func=agg_func,offset=offset,limit=limit)
        return q

    def open_discovery(self, a_id, metric, agg_func, acc_func, year=None,
                       filters=None, limit=None, offset=0):
        """Args:
            a_id (str): ID of [TODO]
            metric (str): Name of metric to use for ranking. Must be one
                of the values returned by get_metrics().
            agg_func (str): Name of the function to use to combine metric
                values over a path. Must be one of the values returned
                by get_aggregation_functions().
            acc_func (str): Name of the function to use to accumulate
                aggregated scores for multiple paths arriving at the same
                node. Must be one of the values returned by
                get_accumulation_functions().
            year (int): The "current" year for purposes of the search, or
                None for the most recent year. Must be within the range
                returned by get_year_range()
            filters (LbdFilters): The filters to apply, or None for no
                filtering.
            limit (int): Maximum number of items to return, or None for
                no limit.
            offset (int): Offset of first item in ranked list to return.
                Used together with limit for paging.

        Raises:
            ValueError if any argument has an inappropriate value.

        Returns:
             Pair of sequences: (IDs, scores).
        """
        if year is None: year = self.max_year()
        self._validate_metric(metric)
        self._validate_aggregation_function(agg_func)
        self._validate_year(year)
        self._validate_filters(filters)
        self._validate_limit(limit)
        self._validate_offset(offset)
        q= self._discovery_query(a_id,metric,agg_func,year,filters,limit=limit,offset=offset)
        debug(q)
        results = self._graph.data(q)
        return [res["id"] for res in results], [res["score"] for res in results]

    def discoverable_edges(self, after, until=None):
        """Return edges appearing after given year that could have been
            discovered before then using A-B-C chaining.

            Args:
                after (int): cutoff year for time-slicing. Only return edges with
                    year > after that connect "A" and "C" nodes where there exist
                    A-B and B-C edges (for at least one B) with year <= after.
                until (int): only return edges with year <= until, or None for
                    no upper limit.

            Returns:
                sequence of dict: edges appearing after given year. Each edge
                    dict has "start" (ID of start node), "end" (ID of end node)
                    and "year" (edge year) key-value pairs.
            """

        self._validate_year(after)
        if until is None: until=self.max_year()
        self._validate_year(until)

        max_year_str = "AND e3.year <= {0}".format(until) if until != None else ""
        q = "MATCH (a)-[e1]-(b)-[e2]-(c)-[e3]-(a) WHERE e1.year <= {0} AND e2.year <= {0} AND e3.year >{0} {1} RETURN DISTINCT a.OID AS A , c.OID AS C, e3.year as e3_year;".format(
            after, max_year_str)
        debug(q)
        rest = self._graph.data(q)
        return rest

    def get_year_range(self):
        """Return minimum and maximum years in the graph.

        Returns:
            Pair of integers (min_year, max_year).
        """

        if self._sentByYears is None:
            self._sentByYears = {make_tuple(x)[0]:make_tuple(x)[1] for x in self.meta_information()["sentence_count"].split(";")}
            self._yearRange= (min(self._sentByYears.keys()),max(self._sentByYears.keys()))
        return self._yearRange

    def get_types(self):
        """Return node types used in the graph.

        Returns:
            list of str: node types.
        """
        if self._entity_types is None:
            q = "MATCH (n:entity) return DISTINCT n.type as type;"
            info(q)
            res = self._graph.data(q)
            self._entity_types = [r["type"] for r in res]
        return self._entity_types

    def get_metrics(self):
        """Return edge weight metrics used in the graph.

        Returns:
            list of str: edge metric names.
        """
        if self._metricsMap is None:
            q = "MATCH ()-[e]-() RETURN keys(e) AS keys LIMIT 1;"
            properties = self._graph.data(q)[0]['keys']
            self._metricsMap = {p[7:]:p for p in properties if p.startswith("metric_")}
        return self._metricsMap.keys()

    def map_metric(self,metric):
        if self._metricsMap is None:
            self.get_metrics()
        return self._metricsMap[metric]


    def get_metric_range(self, metric):
        """Return minimum and maximum values for given metric.

        Args:
            metric (str): Name of metric to return range for. Must be
                one of the values returned by get_metrics().

        Returns:
            Pair of floats (min_value, max_value).
        """
        self._validate_metric(metric)
        if self._metricRangeMap is None:
            self._metricRangeMap = {m: (self.meta_information()[m][0],self.meta_information()[m][1]) for m in self.get_metrics()}
        return self._metricRangeMap[metric]


    def get_aggregation_functions(self):
        """Return list of supported aggregation function names.

        Aggregation functions combine the edge weights along a path
        into a score for node ranking in closed_discovery() and
        open_discovery().

        Returns:
            list of str: aggregation function names.
        """
        return self._aggregation_funcs


    def get_accumulation_functions(self):
        """Return list of supported accumulation function names.

        Accumulation functions total the aggregated scores along multiple
        paths to a node in open_discovery().

        Returns:
            list of str: accumulation function names.
        """
        return ["max"]


    def subgraph_edges(self, nodes, metrics, year=None, filters=None,
                       exclude=None, history=False):
        """Return edges in subgraph containing given nodes.

        Args:
            nodes (list of str): IDs of the nodes of the subgraph.
            metrics (list of str): Names of metrics to return. Must contain
                zero or more of the values returned by get_metrics().
            year (int): The "current" year, or None for the most recent year.
                Edges only appearing after the given year are excluded from
                the subgraph.
            filters (LbdFilters): The filters to apply, or None for no
                filtering.
            exclude (list of str): IDs of nodes of a sub-subgraph to
                excude (i.e return subgraph(nodes) - subgraph(exclude)).
            history (bool): If True, return metric values as list of
                yearly values up to given year, if False, only return
                value for that year.

        Returns:
            sequence of dict: edges in subgraph. Each edge dict has
                "start" (ID of start node), "end" (ID of end node) and
                "year" (edge year), and key-value pairs for each
                requested metric ("metric" argument)."""

        if year is None: year = self.max_year()
        self._validate_year(year)
        self._validate_filters(filters)
        for metric in metrics:
            self._validate_metric(metric)

        edges_filter_str = self._filter_edge_weight_string(filters,["e1"],metrics[0],year)
        #
        if edges_filter_str: edges_filter_str = "AND " + edges_filter_str

        if exclude is None:
            exclude= nodes
        else:
            exclude=list(set(nodes)-set(exclude))

        metlist_str = ",".join(
            [self._metric_str(metric, year, hist=history, e="e1") + " as " + metric for metric in metrics])
        q = "Match (n1)-[e1]-(n2) WHERE (n1.OID IN {includelist}) AND (n2.OID IN {excludelist}) AND e1.year <={year} {filter} RETURN n1.OID as start, n2.OID as end, TYPE(e1) as type,  e1.year as year, {metrics}".format(
            includelist=ujson.dumps(nodes), excludelist=ujson.dumps(exclude), year=year, metrics=metlist_str,
            filter=edges_filter_str)
        logging.debug(q)
        results = self._graph.data(q)
        results = {frozenset((res["start"],res["end"])):res for res in results}
        return results.values()


    def _filter_nodes_string(self, filters, b_nodes, c_nodes=None):
        if filters is None: return ""
        b_nodes_str = (" AND ".join([self._filter_types_string(b,filters.b_types) for b in b_nodes])).strip()
        if not c_nodes is None:
            c_nodes_str = (" AND ".join([self._filter_types_string(c,filters.c_types) for c in c_nodes])).strip()
            return "{b_nodes} AND {c_nodes}".format(b_nodes=b_nodes_str,c_nodes=c_nodes_str)
        return b_nodes_str


    def _filter_edge_weight_string(self, filters, edges, metric,year):
        if not filters: return ""
        if filters.max_weight == None and filters.max_weight==None: return ""
        edges_str = []
        for edge in edges:
            metric_index_str= self._metric_str(metric, year, e=edge)
            if filters.min_weight != None:
                edges_str.append("{met} >= {value}".format(met=metric_index_str,value=filters.min_weight))
            if filters.max_weight != None:
                edges_str.append("{met} <= {value}".format(met=metric_index_str, value=filters.max_weight))
        return " AND ".join(e for e in edges_str).strip()


    def _filter_types_string(self,node,typesList):
        if not typesList: return ""
        retStr = ("OR ".join(["{node}.type=\"{t}\" ".format(node=node,t=t) for t in typesList])).strip()
        return "({0})".format(retStr)


    def _metric_str(self, metric, year, hist=False, e="", map_metric=True):
        if map_metric: metric = self.map_metric(metric)

        index = year - self.max_year()
        if hist:
            if index == 0:
                return "{e}.{m}".format(e=e,m=metric)
            else:
                return "{e}.{m}[0..{i}]".format(e=e,m=metric,i=index)
        else:
            return "{e}.{m}[{i}]".format(e=e,m=metric,i=index-1)

    def get_nodes(self, ids, metric=None, year=None, filters=None,
                  exclude_neighbours_of=None, history=False):
        """Return data for nodes with given IDs.

        Args:
            ids (list of str): IDs of the nodes to return.
            metric (str): Name of metric to use for filtering. Must be one
                of the values returned by get_metrics(), or None if no
                weight filters are applied. Affects edge count.
            year (int): The "current" year, or None for the most recent year.
                Nodes only appearing after the given year are not returned.
            filters (LbdFilters): The filters to apply, or None for no
                filtering. Affects edge count in return values.
            exclude_neighbours_of (str) ID of node whose neighbours to
                exclude from edge counts, or None to include all.
            history (bool): If True, return metric values as list of
                yearly values up to given year, if False, only return
                value for that year.

        Returns:
            sequence of dict: nodes. Each dict has "id", "type", "text",
             "year", "count", "doc_count", and "edge_count" key-value pairs.
            The order of dicts matches the order of given ids.
        """

        if year is None: year = self.max_year()
        self._validate_year(year)
        self._validate_filters(filters)
        filter_list = []
        if exclude_neighbours_of is not None:
            filter_list.append("NOT (n2 IN {excluded_nodes})".format(excluded_nodes=ujson.dumps(exclude_neighbours_of)))
        if not metric is None:
            if filters is None: raise ValueError('filters is given as None when metric is not None,  if metric is not None, filters must be given')
            self._validate_metric(metric)
            edge_filter_str = self._filter_edge_weight_string(filters, ["e1"], metric, year)
            if edge_filter_str: filter_list.append(edge_filter_str)

        node_filter_str = self._filter_nodes_string(filters, ["n2"])
        if node_filter_str: filter_list.append(node_filter_str)
        filter_str = " AND ".join(filter_list)
        if filter_str: filter_str = "AND " + filter_str

        q = "MATCH (n1)-[e1]-(n2) where n1.OID IN {nodes} {filter_str} return n1.OID as id, n1.type as type, n1.text as text, n1.year as year, {count_metric} as count, {doc_count_metric} as doc_count, count(e1) as edge_count".format(
            nodes=ujson.dumps(ids),filter_str=filter_str,count_metric=self._metric_str("count",year,e="n1",hist=history, map_metric=False),doc_count_metric=self._metric_str("doc_count",year,e="n1",hist=history, map_metric=False))

        debug("ids=" + str(ids))
        result = self._graph.data(q)
        debug("results =" + str(ujson.dumps(result, indent=4)))

        resDict = {res["id"]:res for res in result}
        results = [resDict[i] for i in ids]
        debug(results)
        return results


    def meta_information(self):

        if self._metaInfo is None:
            q = "MATCH (n:META) return n;"
            info(q)
            self._metaInfo= self._graph.data(q)[0]["n"]
        return self._metaInfo

    def max_year(self):
        return self.get_year_range()[1]
