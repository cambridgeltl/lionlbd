#!/usr/bin/env python

# Abstract base class for LBD support classes.

from __future__ import print_function
from __future__ import absolute_import

from six import string_types

from abc import ABCMeta, abstractmethod


# TODO move these to a separate config
DEFAULT_METRIC = 'count'
DEFAULT_AGG_FUNC = 'avg'
DEFAULT_ACC_FUNC = 'max'


class LbdFilters(object):
    """Filters applying to LBD queries."""

    def __init__(self, b_types=None, c_types=None, min_weight=None,
                 max_weight=None):
        """Initialize LbdFilters.

        Args:
            b_types: Sequence of type names (str) to restrict neighbours
                to, or None to allow any type.
            c_types: Sequence of type names (str) to restrict 2nd-degree
                neighbours to, or None to allow any type.
            min_weight (float): Minimum metric value to restrict to, or
                None for no lower bound.
            max_weight (float): Maximum metric value to restrict to, or
                None for no upper bound.

        Raises:
            ValueError if any argument has an inappropriate value.
        """
        try:
            b_types = self._validate_types(b_types)
        except:
            raise ValueError('LbdFilters b_types: {}'.format(b_types))

        try:
            c_types = self._validate_types(c_types)
        except:
            raise ValueError('LbdFilters c_types: {}'.format(c_types))

        if min_weight is not None and not isinstance(min_weight, (float, int)):
            raise ValueError('LbdFilters min_weight: {}'.format(min_weight))

        if max_weight is not None and not isinstance(max_weight, (float, int)):
            raise ValueError('LbdFilters max_weight: {}'.format(max_weight))

        self.b_types = b_types
        self.c_types = c_types
        self.min_weight = min_weight
        self.max_weight = max_weight

    def __repr__(self):
        return str({
            'b_types': self.b_types,
            'c_types': self.c_types,
            'min_weight': self.min_weight,
            'max_weight': self.max_weight,
        })

    @staticmethod
    def _validate_types(types):
        if types is None:
            return types
        else:
            if isinstance(types, string_types):
                raise ValueError()
            if any(n for n in types if not isinstance(n, string_types)):
                raise ValueError()
            return list(types)


class LbdInterface(object):
    __metaclass__ = ABCMeta

    """Abstract base class for LBD support classes."""

    @abstractmethod
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

    @abstractmethod
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

    @abstractmethod
    def open_discovery(self, a_id, metric, agg_func, acc_func, year=None,
                       filters=None, limit=None, offset=0):
        """Return [TODO]

        Args:
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

    @abstractmethod
    def get_year_range(self):
        """Return minimum and maximum years in the graph.

        Returns:
            Pair of integers (min_year, max_year).
        """

    @abstractmethod
    def get_types(self):
        """Return node types used in the graph.

        Returns:
            list of str: node types.
        """

    @abstractmethod
    def get_metrics(self):
        """Return names of edge weight metrics used in the graph.

        Returns:
            list of str: edge metric names.
        """

    @abstractmethod
    def get_metric_range(self, metric):
        """Return minimum and maximum values for given metric.

        Args:
            metric (str): Name of metric to return range for. Must be
                one of the values returned by get_metrics().

        Returns:
            Pair of floats (min_value, max_value).
        """

    @abstractmethod
    def get_aggregation_functions(self):
        """Return list of supported aggregation function names.

        Aggregation functions combine the edge weights along a path
        into a score for node ranking in closed_discovery() and
        open_discovery().

        Returns:
            list of str: aggregation function names.
        """

    @abstractmethod
    def get_accumulation_functions(self):
        """Return list of supported accumulation function names.

        Accumulation functions total the aggregated scores along multiple
        paths to a node in open_discovery().

        Returns:
            list of str: accumulation function names.
        """

    @abstractmethod
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
                filtering. Note that weight filters (min_weight and
                max_weight) will only apply to the first given metric
                (i.e. metrics[0]).
            exclude (list of str): IDs of nodes of a sub-subgraph to
                excude (i.e return subgraph(nodes) - subgraph(exclude)).
            history (bool): If True, return metric values as list of
                yearly values up to given year, if False, only return
                value for that year.

        Returns:
            sequence of dict: edges in subgraph. Each edge dict has
                "start" (str, ID of start node), "end" (str, ID of end node),
                "type" (str, edge type), and "year" (int, edge year), and
                key-value pairs for each requested metric ("metric" argument).
        """

    @abstractmethod
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
            sequence of dict: nodes. Each dict has "id" (str), "type" (str),
            "text" (str), "year" (int), "count" (int), "doc_count" (int), and
            "edge_count" (int) key-value pairs. The order of dicts matches the
            order of given ids.
        """

    @abstractmethod
    def meta_information(self):
        """[TODO]"""

    @abstractmethod
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

    def get_metric_information(self):
        """Return information on edge weight metrics used in the graph."""
        infos = []
        for m in sorted(self.get_metrics()):
            info, desc = [m], self._metric_descriptions.get(m, {})
            info_dict = {}
            for d in ('short', 'long', 'full'):
                info_dict[d] = desc.get(d, 'Missing {} description'.format(d))
            info.append(info_dict)
            infos.append(info)
        return infos


    def get_aggregation_function_information(self):
        """Return information on aggregation functions used in the graph.

        Returns:
            list of str 3-tuples: (name, short description, full description) 
            for each aggregation function.
        """

        infos = []
        for af in self.get_aggregation_functions():
            info, desc = [af], self._aggregation_function_descriptions.get(af, {})
            info_dict = {}
            for d in ('short', 'full'):
                info_dict[d] = desc.get(d, 'Missing {} description'.format(d))
            info.append(info_dict)
            infos.append(info)
        return infos



    def _validate_year(self, year):
        """Verify that given year is valid, apply default if None."""
        min_year, max_year = self.get_year_range()
        if year is None:
            return max_year
        elif year < min_year or year > max_year:
            raise ValueError('out of bounds year {}'.format(year))
        return year

    def _validate_metric(self, metric):
        """Verify that given metric is valid, apply default if None."""
        if metric is None:
            return DEFAULT_METRIC
        elif metric not in self.get_metrics():
            raise ValueError('invalid metric {}'.format(metric))
        return metric

    def _validate_metrics(self, metrics):
        """Verify that given sequence of metrics is valid."""
        metrics = list(metrics)
        if len(metrics) != len(set(metrics)):
            raise ValueError('redundant metrics: {}'.format(metrics))
        if [m for m in metrics if m is None]:
            raise ValueError('None in metrics: {}'.format(metrics))
        if [m for m in metrics if m not in self.get_metrics()]:
            raise ValueError('invalid metrics: {}'.format(metrics))
        return metrics

    def _validate_limit(self, limit):
        """Verify that given limit is valid."""
        if limit is None:
            return limit    # None is a valid value
        elif limit <= 0:
            raise ValueError('out of bounds limit {}'.format(limit))
        return limit

    def _validate_offset(self, offset):
        """Verify that given offset is valid, apply default if None"""
        if offset is None:
            return 0
        elif offset < 0:
            raise ValueError('out of bounds offset {}'.format(offset))
        return offset

    def _validate_filters(self, filters):
        """Verify that given LbdFilters are valid, return default if None."""
        if filters is None:
            return LbdFilters()
        types = set(self.get_types())
        for ftypes in (filters.b_types, filters.c_types):
            if ftypes is None:
                continue
            for type_ in ftypes:
                if type_ not in types:
                    raise ValueError('invalid type {}'.format(type_))
        # TODO: validate metric ranges?
        return filters

    def _validate_aggregation_function(self, agg_func):
        """Verify that given aggregation function is valid, apply default if
        None."""
        if agg_func is None:
            return DEFAULT_AGG_FUNC
        elif agg_func not in self.get_aggregation_functions():
            raise ValueError('invalid aggregation function {}'.format(agg_func))
        return agg_func

    def _validate_accumulation_function(self, acc_func):
        """Verify that given accumulation function is valid, apply default if
        None."""
        if acc_func is None:
            return DEFAULT_ACC_FUNC
        elif acc_func not in self.get_accumulation_functions():
            raise ValueError('invalid accumulation function {}'.format(
                acc_func))
        return acc_func

    """Default descriptions for common metrics."""
    _metric_descriptions = {
        "count": {
            "short": "Mentions count",
            "long":  "Sort and filter by number of mentions",
            "full":  "A basic metric based on number of mentions of a particular node"
        },
        "doc_count": {
            "short": "Document count",
            "long":  "Sort and filter by number of documents",
            "full":  "A basic metric based on number of documents mentions occur in"
        },
        "npmi": {
            "short": "Normalized PMI",
            "long":  "Sort and filter by NPMI",
            "full":  "Normalized Pointwise Mutual Information metric"
        },
        "scp": {
            "short": "Symmetric Conditional Probability",
            "long":  "Sort and filter by SCP",
            "full":  "Symmetric Conditional Probability metric"
        },
        "chi2": {
            "short": "Chi-Squared",
            "long":  "Sort and filter by Chi-Squared",
            "full":  "Chi-Squared metric"
        },
        "llr": {
            "short": "Likelihood Ratio",
            "long":  "Sort and filter by Likelihood Ratio",
            "full":  "Likelihood Ratio metric"
        },
        "jaccard": {
            "short": "Jaccard Index",
            "long":  "Sort and filter by Jaccard Index",
            "full":  "Jaccard Index metric"
        },
        "studentt": {
            "short": "Student's t-test",
            "long":  "Sort and filter by Student's t-test",
            "full":  "Student's t-test metric"
        },
    }



    """Default descriptions for common metrics."""
    _aggregation_function_descriptions = {
        "min": {
            "short":"Minimum",           
            "full":"Take minimum weight of edges in path"
        },

        "max": {
            "short": "Maximum",           
            "full": "Take maximum weight of edges in path"
        },

        "avg": {
            "short": "Mean",                  
            "full": "Take mean weight of edges in path"
        },
    }
