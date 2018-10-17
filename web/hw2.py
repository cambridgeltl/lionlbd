


from flask import Flask, render_template,request,json, redirect,url_for
#import N4JController
from py2neo import Node


app = Flask(__name__,static_url_path='/static')


#{"id":"n1", "loaded":true, "style":{"label":"Node 1", "fillColor":"#aaf"}},
 #{"id":"l2","from":"n2", "to":"n3", "style":{"fillColor":"green", "toDecoration":"arrow", "label":"Link 2"}},

entityColours = {"ProteinMutation":"orange","Disease":"grey","DNAMutation":"blue","Chemical":"yellow","SNP":"green","Gene":"red","Species":"pink" }
mincountDefault=10

def nodeClassStyle():
    nodeStyle = {}
    nodeStyle["nodeClasses"] = []
    for entity in entityColours:
        classStyleDict = {}
        classStyleDict["className"] = entity
        classStyleDict["style"] = {}
        classStyleDict["style"] = {"fillColor":entityColours[entity]}
        nodeStyle["nodeClasses"].append(classStyleDict)
    return  nodeStyle

def presentNodes(nodes):
    returnList = []
    for node in nodes:
        n = {}
        n["id"] = "n_" + getIdForNode(node)
        label = next(iter(node.labels))
        n["className"]= label
        n["style"]= {"label": node["text"],"lineWidth":"1", "display":"roundtext", "lineColor":"black", "radius": "35"}
        returnList.append(n)
    return returnList


def presentMiddleNodes(nodes):
    returnList = []
    for node in nodes:
        n = {}

        n["id"] = "n_" + getIdForNode(node)
        label = next(iter(node.labels))
        n["className"]= label
        n["style"]= {"label": node["text"],"lineWidth":"5","display":"roundtext", "lineColor":"black", "radius": "20"}
        returnList.append(n)
    return returnList

def getIdForNode(node):
    if "id" in node.properties:
        return str(node["id"])
    else:
        return str(node._id)

def presentEdges(edges):
    returnList = []
    for edge in edges:
        weight = str(len(edge["target"]))
        e = {}
        if "id" in edge.properties:
            e["id"] = "e_" + str(edge["id"])
        else:
            e["id"] = "e_" + str(edge._id)

        e["from"] = "n_"+ getIdForNode(edge.nodes[0])

        e["to"] = "n_" + getIdForNode(edge.nodes[1])


        e["style"]= {"fillColor":"black", "label":weight}
        returnList.append(e)
    return returnList

currentNodes = []
currentEdges = []

@app.route('/',methods=['POST', 'GET'])
def autoComplete():
    if request.method=='POST':
        textAndType = request.form['autocomplete']
        nodeID =request.form['nodeID']
        #if "isNorm" in request.form:

        isNorm = "isNorm" in request.form #False #request.form["isNorm"]=="True"
        print "isNorm= " + str(isNorm)
        mincount = int(request.form['mincount'])

        if (textAndType.strip()==""):
            return render_template('lion.html')
        print "open discover on node: " + str(nodeID)
        [n2s,n3s,es] = N4JController.openDiscoverByNodeId(nodeID,mincount, isNorm)
        currentEdges.extend(es)
        currentNodes.extend(n2s)
        currentNodes.extend(n3s)

        checked = "checked" if isNorm else ""
        if n2s == [] and n3s == [] and es == []:
            print "no discovery"
            return render_template('lion.html', nodes=[], edges=[], nodeClassStyle=[],
                            selectedText=textAndType, selectedNode=nodeID, mincount=mincount, isNorm=checked)

        print "3ns= " + str(n2s)
        print "2ns= " +  str(n3s)

        nodes = presentMiddleNodes(n2s) + presentNodes(n3s)
        edges = presentEdges(es)

        to_nodes = set(e['to'] for e in edges)
        from_nodes = set(e['from'] for e in edges)
        filter_nodes = to_nodes | from_nodes

        nodes = [n for n in nodes if n['id'] in filter_nodes]

        return render_template('lion.html',nodes=nodes,edges=edges, nodeClassStyle=nodeClassStyle(), selectedText=textAndType, selectedNode=nodeID, mincount=mincount, isNorm=checked)


    else:
        return render_template('lion.html',nodes=[],edges=[],nodeClassStyle=[],selectedText="", selectedNode=None, mincount=mincountDefault, isNorm="")



@app.route('/displayNode',methods=['GET'])
def displayNode():
    selectedNodeID = request.args.get('nodeID')
    selectedNodeID =int(selectedNodeID.replace("n_", ""))
    selectedNode = [n for n in currentNodes if n._id == selectedNodeID][0]
    #return render_template('DisplayNode.html', title=selectedNode["norm"])
   # return redirect(url_for('http://www.example.com', id=selectedNode["norm"]))
    url = "http://172.25.17.57:5002/find/" + selectedNode["norm"]
    return redirect(url, code=302)


@app.route('/displayEdge',methods=['GET'])
def displayEdge():
    #print "displayEdge called"
    selectedEdgeID = request.args.get('edgeID')
    #print selectedEdgeID
    selectedEdgeID =int(selectedEdgeID.replace("e_", ""))

    selectedEdge = [e for e in currentEdges if e._id == selectedEdgeID][0]

    fromNorm = selectedEdge.nodes[0]["norm"]
    toNorm = selectedEdge.nodes[1]["norm"]
    strtxt = fromNorm + " --> " + toNorm

    url = "http://172.25.17.57:5002/find/" + fromNorm + "+" + toNorm

    return redirect(url, code=302)
    #return render_template('DisplayNode.html', title=str(strtxt))



@app.route('/ajaxautocomplete',methods=['POST', 'GET'])
def ajaxautocomplete():
    result=''
    if request.method=='POST':
     query=request.form['query']
     #selection =request.form['autocomplete']
     #print "selection is: " + selection
     result = N4JController.getEntities(query)


     jobj = json.dumps({"suggestions":result})
     #print str(jobj)
     return jobj
    else:
     
     return "ooops"


if __name__ == "__main__":
    #app.run(debug=True)  #debug flag

    app.run(host= '0.0.0.0')
