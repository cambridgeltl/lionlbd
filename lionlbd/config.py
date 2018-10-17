from __future__ import print_function
from __future__ import absolute_import


# Flask debug mode
DEBUG = True

# Port to listen on
PORT = 8080    # 80

# Parameter identifying the query string
QUERY_PARAMETER = 'q'

# Parameter identifying node in client graph
NODE_PARAMETER = 'n'

# Parameter identifying the page number (pagination)
PAGE_PARAMETER = 'page'

# Parameter determining whether to inline referenced resources
EXPAND_PARAMETER = 'expand'

# Parameter determining edge metric
EDGE_METRIC_PARAMETER = 'edge_metric'


# Parameter determining aggregation function for closed discovery
AGGREGATION_FUNC_PARAMETER = 'aggregation_func'

# Parameter determining type
FILTER_TYPE_PARAMETER = 'type'

# Parameter determining year
YEAR_PARAMETER = 'year_end'

# Parameter determining weight start
WEIGHT_START_PARAMETER = 'weight_start'

# Parameter determining weight end
WEIGHT_END_PARAMETER = 'weight_end'

# Parameter determining discovery mode
DISCOVERY_MODE_PARAMETER = 'discovery_mode'

# Parameter determining whether to include metric history
HISTORY_PARAMETER = 'history'

# Pagination page size for mentions
RESULTS_PER_PAGE_MENTION = 100

# Pagination page size for nodes
RESULTS_PER_PAGE_NODE = 15

# http://jinja.pocoo.org/docs/templates/#whitespace-control
TRIM_BLOCKS = True

