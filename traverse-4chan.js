const GREEN_COLOR = "rgb(20,83,45)";
const YELLOW_COLOR = "rgb(113,63,18)";

class Node {
  visited = false;
  parents = [];
  children = [];
}

class Graph {
  nodes = {};

  addNode(id) {
    this.nodes[id] = new Node();
  }

  addChild(id, child) {
    this.nodes[id].children.push(child);
  }

  addParent(id, parent) {
    this.nodes[id].parents.push(parent);
  }

  areAllParentsVisited(node) {
    const parents = node.parents;
    for (let i = 0; i < parents.length; i++) {
      if (!this.nodes[parents[i]].visited) {
        return false;
      }
    }
    return true;
  }

  traverse(history, id) {
    const node = this.nodes[id];
    if (!this.areAllParentsVisited(node)) {
      history.push({ id: id, statusColor: YELLOW_COLOR });
      return;
    }
    history.push({ id: id, statusColor: GREEN_COLOR });
    node.visited = true;
    for (let i = 0; i < node.children.length; i++) {
      this.traverse(history, node.children[i]);
    }
    return;
  }

  getTraversalHistory(nodeIds) {
    const history = [];
    for (let i = 0; i < nodeIds.length; i++) {
      if (!this.nodes[nodeIds[i]].visited) {
        this.traverse(history, nodeIds[i]);
      }
    }
    return history;
  }

  areAllNodesVisited() {
    for (const key in this.nodes) {
      if (!this.nodes[key].visited) {
        return false;
      }
    }
    return true;
  }
}

function getChildren(postNode) {
  const children = postNode
    .querySelector(".postInfo")
    .querySelectorAll(".quotelink");
  const result = [];
  for (let i = 0; i < children.length; i++) {
    result.push(children[i].hash.slice(1));
  }
  return result;
}

function getParents(postNode) {
  const boardId = document
    .querySelector(".navLinks.desktop")
    .querySelector("a")
    .pathname.slice(1, -1);
  const threadId = document.querySelector(".thread").id.slice(1);
  const parents = postNode
    .querySelector(".postMessage")
    .querySelectorAll(".quotelink");
  const result = [];

  for (let i = 0; i < parents.length; i++) {
    // parent must be in the same thread
    if (parents[i].href.includes(`/${boardId}/thread/${threadId}#`)) {
      result.push(parents[i].hash.slice(1));
    }
  }

  return result;
}

function scrollToPost(postNode, statusColor) {
  postNode.style.backgroundColor = statusColor;
  postNode.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function scrollToEachPost(postNodeMap, history, delay) {
  if (history.length === 0) {
    return;
  }
  scrollToPost(postNodeMap[history[0].id], history[0].statusColor);
  let i = 1;
  const intervalId = setInterval(() => {
    if (i === history.length) {
      clearInterval(intervalId);
      return;
    }
    scrollToPost(postNodeMap[history[i].id], history[i].statusColor);
    i++;
  }, delay);
}

function main() {
  const postNodeList = document.querySelectorAll(".post");
  const postNodeMap = {};
  const graph = new Graph();
  const posts = [];

  for (let i = 0; i < postNodeList.length; i++) {
    const id = postNodeList[i].id;

    postNodeMap[id] = postNodeList[i];
    graph.addNode(id);
    posts.push(id);

    const children = getChildren(postNodeList[i]);
    for (let j = 0; j < children.length; j++) {
      graph.addChild(id, children[j]);
    }

    // skip quotelinks in op's post message
    if (i > 0) {
      const parents = getParents(postNodeList[i]);
      for (let j = 0; j < parents.length; j++) {
        graph.addParent(id, parents[j]);
      }
    }
  }

  const readTimeInMs = 5000;
  scrollToEachPost(postNodeMap, graph.getTraversalHistory(posts), readTimeInMs);

  console.log(graph.areAllNodesVisited());
}

main();
