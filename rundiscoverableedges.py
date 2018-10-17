from lionlbd import neo4jinterface
import ujson
nji =  neo4jinterface.Neo4jInterface()
print("running discoverable_edges (2007)")
results = nji.discoverable_edges(2007)
open("./discoverable_edges_complete_2007.json", 'w').write(ujson.dumps(results,indent=4))

print("running discoverable_edges (2002 - 2007)")
results = nji.discoverable_edges(2002,2007)
open("./discoverable_edges_complete_2002_2007.json", 'w').write(ujson.dumps(results,indent=4))
