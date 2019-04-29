import { LogUtils } from "../utils";

/*
 * @Author: doyle.wu
 * @Date: 2019-03-28 09:07:20
 *
 * copy from https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/heap_snapshot_worker
 */

const logger = LogUtils.getLogger(__filename);

const baseSystemDistance = 100000000;

class Statistics {
  total;
  v8heap;
  native;
  code;
  jsArrays;
  strings;
  system;
}

class Location {
  scriptId;
  lineNumber;
  columnNumber;

  constructor(scriptId, lineNumber, columnNumber) {
    this.scriptId = scriptId;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
  }
}


class JSHeapSnapshotEdge {
  snapshot: HeapSnapshot;
  edgeIndex: number;
  edges: Uint32Array;

  constructor(snapshot, edgeIndex) {
    this.snapshot = snapshot;
    this.edgeIndex = edgeIndex || 0;
    this.edges = snapshot.containmentEdges;
  }

  clone() {
    const snapshot = this.snapshot;
    return new JSHeapSnapshotEdge(snapshot, this.edgeIndex);
  }

  node() {
    return this.snapshot.createNode(this.nodeIndex());
  }

  nodeIndex() {
    return this.edges[this.edgeIndex + this.snapshot.edgeToNodeOffset];
  }

  /**
   * @override
   * @return {boolean}
   */
  hasStringName() {
    if (!this.isShortcut())
      return this._hasStringName();
    return isNaN(parseInt(this._name() as string, 10));
  }

  /**
   * @return {boolean}
   */
  isElement() {
    return this.rawType() === this.snapshot.edgeElementType;
  }

  /**
   * @return {boolean}
   */
  isHidden() {
    return this.rawType() === this.snapshot.edgeHiddenType;
  }

  /**
   * @return {boolean}
   */
  isWeak() {
    return this.rawType() === this.snapshot.edgeWeakType;
  }

  /**
   * @return {boolean}
   */
  isInternal() {
    return this.rawType() === this.snapshot.edgeInternalType;
  }

  /**
   * @return {boolean}
   */
  isInvisible() {
    return this.rawType() === this.snapshot.edgeInvisibleType;
  }

  /**
   * @return {boolean}
   */
  isShortcut() {
    return this.rawType() === this.snapshot.edgeShortcutType;
  }

  /**
   * @override
   * @return {string}
   */
  name() {
    const name = this._name();
    if (!this.isShortcut())
      return String(name);
    const numName = parseInt(name as string, 10);
    return String(isNaN(numName) ? name : numName);
  }

  /**
   * @override
   * @return {string}
   */
  toString() {
    const name = this.name();
    switch (this.type()) {
      case 'context':
        return '->' + name;
      case 'element':
        return '[' + name + ']';
      case 'weak':
        return '[[' + name + ']]';
      case 'property':
        return name.indexOf(' ') === -1 ? '.' + name : '["' + name + '"]';
      case 'shortcut':
        if (typeof name === 'string')
          return name.indexOf(' ') === -1 ? '.' + name : '["' + name + '"]';
        else
          return '[' + name + ']';
      case 'internal':
      case 'hidden':
      case 'invisible':
        return '{' + name + '}';
    }
    return '?' + name + '?';
  }

  /**
   * @return {boolean}
   */
  _hasStringName() {
    const type = this.rawType();
    const snapshot = this.snapshot;
    return type !== snapshot.edgeElementType && type !== snapshot.edgeHiddenType;
  }

  /**
   * @return {string|number}
   */
  _name() {
    return this._hasStringName() ? this.snapshot.strings[this._nameOrIndex()] : this._nameOrIndex();
  }

  /**
   * @return {number}
   */
  _nameOrIndex() {
    return this.edges[this.edgeIndex + this.snapshot.edgeNameOffset];
  }

  /**
   * @override
   * @return {number}
   */
  rawType() {
    return this.edges[this.edgeIndex + this.snapshot.edgeTypeOffset];
  }

  type() {
    return this.snapshot.edgeTypes[this.rawType()];
  }

  /**
   * @override
   * @return {number}
   */
  itemIndex() {
    return this.edgeIndex;
  }
}

class JSHeapSnapshotRetainerEdge {
  snapshot: HeapSnapshot;
  retainerIndex: number;
  globalEdgeIndex: number;
  retainingNodeIndex: number;
  edgeInstance: JSHeapSnapshotEdge;
  nodeInstance: HeapSnapshotNode;

  constructor(snapshot: HeapSnapshot, retainerIndex: number) {
    this.snapshot = snapshot;
    this.setRetainerIndex(retainerIndex);
  }

  clone() {
    const snapshot = this.snapshot;
    return new JSHeapSnapshotRetainerEdge(snapshot, this.retainerIndex);
  }

  setRetainerIndex(retainerIndex) {
    if (retainerIndex === this.retainerIndex)
      return;
    this.retainerIndex = retainerIndex;
    this.globalEdgeIndex = this.snapshot.retainingEdges[retainerIndex];
    this.retainingNodeIndex = this.snapshot.retainingNodes[retainerIndex];
    this.edgeInstance = null;
    this.nodeInstance = null;
  }

  /**
   * @param {number} edgeIndex
   */
  set edgeIndex(edgeIndex) {
    this.setRetainerIndex(edgeIndex);
  }

  private _node(): HeapSnapshotNode {
    if (!this.nodeInstance)
      this.nodeInstance = this.snapshot.createNode(this.retainingNodeIndex);
    return this.nodeInstance;
  }

  private _edge(): JSHeapSnapshotEdge {
    if (!this.edgeInstance)
      this.edgeInstance = this.snapshot.createEdge(this.globalEdgeIndex);
    return this.edgeInstance;
  }

  isHidden() {
    return this._edge().isHidden();
  }

  /**
   * @return {boolean}
   */
  isInternal() {
    return this._edge().isInternal();
  }

  /**
   * @return {boolean}
   */
  isInvisible() {
    return this._edge().isInvisible();
  }

  /**
   * @return {boolean}
   */
  isShortcut() {
    return this._edge().isShortcut();
  }

  /**
   * @return {boolean}
   */
  isWeak() {
    return this._edge().isWeak();
  }

  node() {
    return this._node();
  }

  name() {
    return this._edge().name();
  }
}

class HeapSnapshotEdgeIterator {
  node: HeapSnapshotNode;
  edge: JSHeapSnapshotEdge;

  constructor(node: HeapSnapshotNode) {
    this.node = node;
    this.edge = node.snapshot.createEdge(node.edgeIndexesStart());
  }

  hasNext() {
    return this.edge.edgeIndex < this.node.edgeIndexesEnd();
  }

  /**
   * @override
   * @return {!HeapSnapshotWorker.HeapSnapshotEdge}
   */
  item() {
    return this.edge;
  }

  /**
   * @override
   */
  next() {
    this.edge.edgeIndex += this.edge.snapshot.edgeFieldsCount;
  }
}

class HeapSnapshotRetainerEdgeIterator {
  retainersEnd: number;
  retainer: JSHeapSnapshotRetainerEdge;

  constructor(retainedNode: HeapSnapshotNode) {
    const snapshot = retainedNode.snapshot;
    const retainedNodeOrdinal = retainedNode.ordinal();
    const retainerIndex = snapshot.firstRetainerIndex[retainedNodeOrdinal];
    this.retainersEnd = snapshot.firstRetainerIndex[retainedNodeOrdinal + 1];
    this.retainer = snapshot.createRetainingEdge(retainerIndex);
  }

  hasNext() {
    return this.retainer.retainerIndex < this.retainersEnd;
  }

  /**
   * @override
   * @return {!HeapSnapshotWorker.HeapSnapshotRetainerEdge}
   */
  item() {
    return this.retainer;
  }

  /**
   * @override
   */
  next() {
    this.retainer.setRetainerIndex(this.retainer.retainerIndex + 1);
  }
}

class HeapSnapshotNode {
  snapshot: HeapSnapshot;
  nodeIndex: number;

  constructor(snapshot: HeapSnapshot, nodeIndex: number) {
    this.snapshot = snapshot;
    this.nodeIndex = nodeIndex || 0;
  }

  retainedSize() {
    return this.snapshot.retainedSizes[this.ordinal()];
  }

  traceNodeId() {
    const snapshot = this.snapshot;
    return snapshot.nodes[this.nodeIndex + snapshot.nodeTraceNodeIdOffset];
  }

  retainersCount() {
    const snapshot = this.snapshot;
    const ordinal = this.ordinal();
    return snapshot.firstRetainerIndex[ordinal + 1] - snapshot.firstRetainerIndex[ordinal];
  }

  distance() {
    return this.snapshot.nodeDistances[this.nodeIndex / this.snapshot.nodeFieldCount];
  }

  dominatorIndex() {
    const nodeFieldCount = this.snapshot.nodeFieldCount;
    return this.snapshot.dominatorsTree[this.nodeIndex / this.snapshot.nodeFieldCount] * nodeFieldCount;
  }

  isRoot() {
    return this.nodeIndex === this.snapshot.rootNodeIndex;
  }

  name() {
    const snapshot = this.snapshot;
    return this.snapshot.strings[snapshot.nodes[this.nodeIndex + snapshot.nodeNameOffset]];
  }

  edges() {
    return new HeapSnapshotEdgeIterator(this);
  }

  selfSize() {
    const snapshot = this.snapshot;
    return snapshot.nodes[this.nodeIndex + snapshot.nodeSelfSizeOffset];
  }

  edgeIndexesStart() {
    const index = this.nodeIndex / this.snapshot.nodeFieldCount;
    return this.snapshot.firstEdgeIndexes[index];
  }

  isHidden() {
    return this.rawType() === this.snapshot.nodeHiddenType;
  }

  /**
   * @return {boolean}
   */
  isArray() {
    return this.rawType() === this.snapshot.nodeArrayType;
  }

  isDocumentDOMTreesRoot() {
    return this.isSynthetic() && this.name() === '(Document DOM trees)';
  }

  /**
   * @return {boolean}
   */
  isSynthetic() {
    return this.rawType() === this.snapshot.nodeSyntheticType;
  }

  isUserRoot() {
    return !this.isSynthetic();
  }

  /**
   * @return {number}
   */
  edgeIndexesEnd() {
    const index = this.nodeIndex / this.snapshot.nodeFieldCount;
    return this.snapshot.firstEdgeIndexes[index + 1];
  }

  edgesCount() {
    return (this.edgeIndexesEnd() - this.edgeIndexesStart()) / this.snapshot.edgeFieldsCount;
  }

  nextNodeIndex() {
    return this.nodeIndex + this.snapshot.nodeFieldCount;
  }

  rawType() {
    const snapshot = this.snapshot;
    return snapshot.nodes[this.nodeIndex + snapshot.nodeTypeOffset];
  }

  type() {
    return this.snapshot.nodeTypes[this.rawType()];
  }

  ordinal() {
    return this.nodeIndex / this.snapshot.nodeFieldCount;
  }

  retainers() {
    return new HeapSnapshotRetainerEdgeIterator(this);
  }

  className() {
    const type = this.type();
    switch (type) {
      case 'hidden':
        return '(system)';
      case 'object':
      case 'native':
        return this.name();
      case 'code':
        return '(compiled code)';
      default:
        return '(' + type + ')';
    }
  }

  classIndex() {
    const snapshot = this.snapshot;
    const nodes = snapshot.nodes;
    const type = nodes[this.nodeIndex + snapshot.nodeTypeOffset];
    if (type === snapshot.nodeObjectType || type === snapshot.nodeNativeType)
      return nodes[this.nodeIndex + snapshot.nodeNameOffset];
    return -1 - type;
  }

  id() {
    const snapshot = this.snapshot;
    return snapshot.nodes[this.nodeIndex + snapshot.nodeIdOffset];
  }
}


class HeapSnapshot {
  nodes: Uint32Array;
  containmentEdges: Uint32Array;
  meta: {};
  rawSamples: Array<number>;
  samples: any;
  strings: Array<string>;
  locations: Array<number>;

  nodeCount: number;
  nodeTypeOffset: number;
  nodeNameOffset: number;
  nodeIdOffset: number;
  nodeSelfSizeOffset: number;
  nodeEdgeCountOffset: number;
  nodeTraceNodeIdOffset: number;
  nodeFieldCount: number;
  nodeTypes: Array<string>;
  nodeArrayType: number;
  nodeHiddenType: number;
  nodeObjectType: number;
  nodeNativeType: number;
  nodeConsStringType: number;
  nodeSlicedStringType: number;
  nodeCodeType: number;
  nodeSyntheticType: number;

  edgeCount: number;
  edgeFieldsCount: number;
  edgeTypeOffset: number;
  edgeNameOffset: number;
  edgeToNodeOffset: number;
  edgeTypes: Array<string>;
  edgeElementType: number;
  edgeHiddenType: number;
  edgeInternalType: number;
  edgeShortcutType: number;
  edgeWeakType: number;
  edgeInvisibleType: number;

  locationIndexOffset: number;
  locationScriptIdOffset: number;
  locationLineOffset: number;
  locationColumnOffset: number;
  locationFieldCount: number;

  retainedSizes: Float64Array;
  // record the index of first edge per node
  firstEdgeIndexes: Uint32Array;
  retainingNodes: Uint32Array;
  retainingEdges: Uint32Array;
  // record the index of first parent per node
  firstRetainerIndex: Uint32Array;
  nodeDistances: Int32Array;
  firstDominatedNodeIndex: Uint32Array;
  dominatedNodes: Uint32Array;
  dominatorsTree: Uint32Array;
  flags: Uint32Array;
  nodeFlags: {
    canBeQueried: number,
    detachedDOMTreeNode: number,
    pageObject: number
  };

  noDistance: number;
  rootNodeIndex: number;
  snapshotDiffs: {};
  aggregatesDiffs: any;
  aggregates: {};
  aggregatesSortedFlags: {};
  profile: {};

  statistics: Statistics;

  lazyStringCache: {};

  locationMap: Map<number, Location>;

  constructor(data) {
    this.nodes = data.nodes;
    this.containmentEdges = data.edges;
    this.meta = data.snapshot.meta;
    this.rawSamples = data.samples;
    this.samples = null;
    this.strings = data.strings;
    this.locations = data.locations;

    this.noDistance = -5;
    this.rootNodeIndex = 0;
    if (data.snapshot.root_index) {
      this.rootNodeIndex = data.snapshot.root_index;
    }

    this.snapshotDiffs = {};
    this.aggregatesDiffs = null;
    this.aggregates = {};
    this.aggregatesSortedFlags = {};
    this.profile = data;

    this.nodeFlags = {
      canBeQueried: 1,
      detachedDOMTreeNode: 2,
      pageObject: 4
    };

    this.lazyStringCache = {};

    this._initialize();
  }

  createEdge(edgeIndex) {
    return new JSHeapSnapshotEdge(this, edgeIndex);
  }

  createRetainingEdge(retainerIndex) {
    return new JSHeapSnapshotRetainerEdge(this, retainerIndex);
  }

  private _initialize() {
    const meta = this.meta;
    const nodeFields = meta['node_fields'];

    this.nodeTypeOffset = nodeFields.indexOf('type');
    this.nodeNameOffset = nodeFields.indexOf('name');
    this.nodeIdOffset = nodeFields.indexOf('id');
    this.nodeSelfSizeOffset = nodeFields.indexOf('self_size');
    this.nodeEdgeCountOffset = nodeFields.indexOf('edge_count');
    this.nodeTraceNodeIdOffset = nodeFields.indexOf('trace_node_id');
    this.nodeFieldCount = nodeFields.length;

    this.nodeTypes = meta['node_types'][this.nodeTypeOffset];
    this.nodeArrayType = this.nodeTypes.indexOf('array');
    this.nodeHiddenType = this.nodeTypes.indexOf('hidden');
    this.nodeObjectType = this.nodeTypes.indexOf('object');
    this.nodeNativeType = this.nodeTypes.indexOf('native');
    this.nodeConsStringType = this.nodeTypes.indexOf('concatenated string');
    this.nodeSlicedStringType = this.nodeTypes.indexOf('sliced string');
    this.nodeCodeType = this.nodeTypes.indexOf('code');
    this.nodeSyntheticType = this.nodeTypes.indexOf('synthetic');

    const edgeFields = meta['edge_fields'];

    this.edgeFieldsCount = edgeFields.length;
    this.edgeTypeOffset = edgeFields.indexOf('type');
    this.edgeNameOffset = edgeFields.indexOf('name_or_index');
    this.edgeToNodeOffset = edgeFields.indexOf('to_node');

    this.edgeTypes = meta['edge_types'][this.edgeTypeOffset];
    this.edgeTypes.push('invisible');
    this.edgeElementType = this.edgeTypes.indexOf('element');
    this.edgeHiddenType = this.edgeTypes.indexOf('hidden');
    this.edgeInternalType = this.edgeTypes.indexOf('internal');
    this.edgeShortcutType = this.edgeTypes.indexOf('shortcut');
    this.edgeWeakType = this.edgeTypes.indexOf('weak');
    this.edgeInvisibleType = this.edgeTypes.indexOf('invisible');

    const locationFields = meta['location_fields'] || [];

    this.locationIndexOffset = locationFields.indexOf('object_index');
    this.locationScriptIdOffset = locationFields.indexOf('script_id');
    this.locationLineOffset = locationFields.indexOf('line');
    this.locationColumnOffset = locationFields.indexOf('column');
    this.locationFieldCount = locationFields.length;

    this.nodeCount = this.nodes.length / this.nodeFieldCount;
    this.edgeCount = this.containmentEdges.length / this.edgeFieldsCount;

    this.retainedSizes = new Float64Array(this.nodeCount);
    this.firstEdgeIndexes = new Uint32Array(this.nodeCount + 1);
    this.retainingNodes = new Uint32Array(this.edgeCount);
    this.retainingEdges = new Uint32Array(this.edgeCount);
    this.firstRetainerIndex = new Uint32Array(this.nodeCount + 1);
    this.nodeDistances = new Int32Array(this.nodeCount);
    this.firstDominatedNodeIndex = new Uint32Array(this.nodeCount + 1);
    this.dominatedNodes = new Uint32Array(this.nodeCount - 1);

    this._buildEdgeIndexes();

    this._buildRetainers();

    this._calculateFlags();

    this._calculateDistances();

    const result = this._buildPostOrderIndex();

    this.dominatorsTree = this._buildDominatorTree(result.postOrderIndex2NodeOrdinal, result.nodeOrdinal2PostOrderIndex);

    this._calculateRetainedSizes(result.postOrderIndex2NodeOrdinal);

    this._buildDominatedNodes();

    this._calculateStatistics();
  }

  /**
   * record first edge of every node
   */
  private _buildEdgeIndexes() {
    const nodes = this.nodes;
    const nodeCount = this.nodeCount;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const nodeFieldCount = this.nodeFieldCount;
    const edgeFieldsCount = this.edgeFieldsCount;
    const nodeEdgeCountOffset = this.nodeEdgeCountOffset;
    firstEdgeIndexes[nodeCount] = this.containmentEdges.length;

    for (let nodeOrdinal = 0, edgeIndex = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) {
      firstEdgeIndexes[nodeOrdinal] = edgeIndex;
      edgeIndex += nodes[nodeOrdinal * nodeFieldCount + nodeEdgeCountOffset] * edgeFieldsCount;
    }
  }

  private _buildRetainers() {
    const retainingNodes = this.retainingNodes;
    const retainingEdges = this.retainingEdges;
    // Index of the first retainer in the _retainingNodes and _retainingEdges
    // arrays. Addressed by retained node index.
    const firstRetainerIndex = this.firstRetainerIndex;

    const containmentEdges = this.containmentEdges;
    const edgeFieldsCount = this.edgeFieldsCount;
    const nodeFieldCount = this.nodeFieldCount;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const nodeCount = this.nodeCount;

    for (let toNodeFieldIndex = edgeToNodeOffset;
      toNodeFieldIndex < containmentEdges.length;
      toNodeFieldIndex += edgeFieldsCount) {

      const toNodeIndex = containmentEdges[toNodeFieldIndex];
      if (toNodeIndex % nodeFieldCount)
        throw new Error('Invalid toNodeIndex ' + toNodeIndex);
      ++firstRetainerIndex[toNodeIndex / nodeFieldCount];
    }

    for (let i = 0, firstUnusedRetainerSlot = 0; i < nodeCount; i++) {
      const retainersCount = firstRetainerIndex[i];
      firstRetainerIndex[i] = firstUnusedRetainerSlot;

      retainingNodes[firstUnusedRetainerSlot] = retainersCount;
      firstUnusedRetainerSlot += retainersCount;
    }
    firstRetainerIndex[nodeCount] = retainingNodes.length;

    let nextNodeFirstEdgeIndex = firstEdgeIndexes[0];
    for (let srcNodeOrdinal = 0; srcNodeOrdinal < nodeCount; ++srcNodeOrdinal) {
      const firstEdgeIndex = nextNodeFirstEdgeIndex;
      nextNodeFirstEdgeIndex = firstEdgeIndexes[srcNodeOrdinal + 1];
      const srcNodeIndex = srcNodeOrdinal * nodeFieldCount;
      for (let edgeIndex = firstEdgeIndex; edgeIndex < nextNodeFirstEdgeIndex; edgeIndex += edgeFieldsCount) {
        const toNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
        if (toNodeIndex % nodeFieldCount)
          throw new Error('Invalid toNodeIndex ' + toNodeIndex);
        const firstRetainerSlotIndex = firstRetainerIndex[toNodeIndex / nodeFieldCount];
        const nextUnusedRetainerSlotIndex = firstRetainerSlotIndex + (--retainingNodes[firstRetainerSlotIndex]);
        retainingNodes[nextUnusedRetainerSlotIndex] = srcNodeIndex;
        retainingEdges[nextUnusedRetainerSlotIndex] = edgeIndex;
      }
    }
  }

  private _calculateFlags() {
    this.flags = new Uint32Array(this.nodeCount);

    this._markDetachedDOMTreeNodes();

    this._markQueriableHeapObjects();

    this._markPageOwnedNodes();
  }

  private _markDetachedDOMTreeNodes() {
    const nodes = this.nodes;
    const nodesLength = nodes.length;
    const nodeFieldCount = this.nodeFieldCount;
    const nodeNativeType = this.nodeNativeType;
    const nodeTypeOffset = this.nodeTypeOffset;
    const flag = this.nodeFlags.detachedDOMTreeNode;
    const node = this.rootNode();
    for (let nodeIndex = 0, ordinal = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount, ordinal++) {
      const nodeType = nodes[nodeIndex + nodeTypeOffset];
      if (nodeType !== nodeNativeType)
        continue;
      node.nodeIndex = nodeIndex;
      if (node.name().startsWith('Detached '))
        this.flags[ordinal] |= flag;
    }
  }

  private _markQueriableHeapObjects() {
    // Allow runtime properties query for objects accessible from Window objects
    // via regular properties, and for DOM wrappers. Trying to access random objects
    // can cause a crash due to insonsistent state of internal properties of wrappers.
    const flag = this.nodeFlags.canBeQueried;
    const hiddenEdgeType = this.edgeHiddenType;
    const internalEdgeType = this.edgeInternalType;
    const invisibleEdgeType = this.edgeInvisibleType;
    const weakEdgeType = this.edgeWeakType;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeFieldsCount = this.edgeFieldsCount;
    const containmentEdges = this.containmentEdges;
    const nodeFieldCount = this.nodeFieldCount;
    const firstEdgeIndexes = this.firstEdgeIndexes;

    const flags = this.flags;
    const list = [];

    for (let iter = this.rootNode().edges(); iter.hasNext(); iter.next()) {
      if (iter.edge.node().isUserRoot()) {
        list.push(iter.edge.node().nodeIndex / nodeFieldCount);
      }
    }

    while (list.length) {
      const nodeOrdinal = list.pop();
      if (flags[nodeOrdinal] & flag)
        continue;
      flags[nodeOrdinal] |= flag;
      const beginEdgeIndex = firstEdgeIndexes[nodeOrdinal];
      const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
      for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
        const childNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
        const childNodeOrdinal = childNodeIndex / nodeFieldCount;
        if (flags[childNodeOrdinal] & flag)
          continue;
        const type = containmentEdges[edgeIndex + edgeTypeOffset];
        if (type === hiddenEdgeType || type === invisibleEdgeType || type === internalEdgeType || type === weakEdgeType)
          continue;
        list.push(childNodeOrdinal);
      }
    }
  }

  _markPageOwnedNodes() {
    const edgeShortcutType = this.edgeShortcutType;
    const edgeElementType = this.edgeElementType;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeFieldsCount = this.edgeFieldsCount;
    const edgeWeakType = this.edgeWeakType;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const containmentEdges = this.containmentEdges;
    const nodeFieldCount = this.nodeFieldCount;
    const nodesCount = this.nodeCount;

    const flags = this.flags;
    const pageObjectFlag = this.nodeFlags.pageObject;

    const nodesToVisit = new Uint32Array(nodesCount);
    let nodesToVisitLength = 0;

    const rootNodeOrdinal = this.rootNodeIndex / nodeFieldCount;
    const node = this.rootNode();

    // Populate the entry points. They are Window objects and DOM Tree Roots.
    for (let edgeIndex = firstEdgeIndexes[rootNodeOrdinal], endEdgeIndex = firstEdgeIndexes[rootNodeOrdinal + 1];
      edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
      const edgeType = containmentEdges[edgeIndex + edgeTypeOffset];
      const nodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
      if (edgeType === edgeElementType) {
        node.nodeIndex = nodeIndex;
        if (!node.isDocumentDOMTreesRoot())
          continue;
      } else if (edgeType !== edgeShortcutType) {
        continue;
      }
      const nodeOrdinal = nodeIndex / nodeFieldCount;
      nodesToVisit[nodesToVisitLength++] = nodeOrdinal;
      flags[nodeOrdinal] |= pageObjectFlag;
    }

    // Mark everything reachable with the pageObject flag.
    while (nodesToVisitLength) {
      const nodeOrdinal = nodesToVisit[--nodesToVisitLength];
      const beginEdgeIndex = firstEdgeIndexes[nodeOrdinal];
      const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
      for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
        const childNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
        const childNodeOrdinal = childNodeIndex / nodeFieldCount;
        if (flags[childNodeOrdinal] & pageObjectFlag)
          continue;
        const type = containmentEdges[edgeIndex + edgeTypeOffset];
        if (type === edgeWeakType)
          continue;
        nodesToVisit[nodesToVisitLength++] = childNodeOrdinal;
        flags[childNodeOrdinal] |= pageObjectFlag;
      }
    }
  }

  private _calculateDistances() {
    const filter = (node: HeapSnapshotNode, edge: JSHeapSnapshotEdge) => {
      if (node.isHidden())
        return edge.name() !== 'sloppy_function_map' || node.name() !== 'system / NativeContext';
      if (node.isArray()) {
        // DescriptorArrays are fixed arrays used to hold instance descriptors.
        // The format of the these objects is:
        //   [0]: Number of descriptors
        //   [1]: Either Smi(0) if uninitialized, or a pointer to small fixed array:
        //          [0]: pointer to fixed array with enum cache
        //          [1]: either Smi(0) or pointer to fixed array with indices
        //   [i*3+2]: i-th key
        //   [i*3+3]: i-th type
        //   [i*3+4]: i-th descriptor
        // As long as maps may share descriptor arrays some of the descriptor
        // links may not be valid for all the maps. We just skip
        // all the descriptor links when calculating distances.
        // For more details see http://crbug.com/413608
        if (node.name() !== '(map descriptors)')
          return true;
        const index = parseInt(edge.name());
        return index < 2 || (index % 3) !== 1;
      }
      return true;
    }

    const nodeCount = this.nodeCount;
    const distances = this.nodeDistances;
    const noDistance = this.noDistance;
    for (let i = 0; i < nodeCount; ++i) {
      distances[i] = noDistance;
    }

    const nodesToVisit = new Uint32Array(this.nodeCount);
    let nodesToVisitLength = 0;

    // BFS for user root objects.
    for (let iter = this.rootNode().edges(); iter.hasNext(); iter.next()) {
      const node = iter.edge.node();
      if (this.isUserRoot(node)) {
        distances[node.ordinal()] = 1;
        nodesToVisit[nodesToVisitLength++] = node.nodeIndex;
      }
    }
    this._bfs(nodesToVisit, nodesToVisitLength, distances, filter);

    // BFS for objects not reached from user roots.
    distances[this.rootNode().ordinal()] = nodesToVisitLength > 0 ? baseSystemDistance : 0;
    nodesToVisit[0] = this.rootNode().nodeIndex;
    nodesToVisitLength = 1;
    this._bfs(nodesToVisit, nodesToVisitLength, distances, filter);
  }

  private _bfs(nodesToVisit, nodesToVisitLength, distances, filter) {
    // Preload fields into local variables for better performance.
    const edgeFieldsCount = this.edgeFieldsCount;
    const nodeFieldCount = this.nodeFieldCount;
    const containmentEdges = this.containmentEdges;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const edgeTypeOffset = this.edgeTypeOffset;
    const nodeCount = this.nodeCount;
    const edgeWeakType = this.edgeWeakType;
    const noDistance = this.noDistance;

    let index = 0;
    const edge = this.createEdge(0);
    const node = this.createNode(0);
    while (index < nodesToVisitLength) {
      const nodeIndex = nodesToVisit[index++];  // shift generates too much garbage.
      const nodeOrdinal = nodeIndex / nodeFieldCount;
      const distance = distances[nodeOrdinal] + 1;
      const firstEdgeIndex = firstEdgeIndexes[nodeOrdinal];
      const edgesEnd = firstEdgeIndexes[nodeOrdinal + 1];
      node.nodeIndex = nodeIndex;
      for (let edgeIndex = firstEdgeIndex; edgeIndex < edgesEnd; edgeIndex += edgeFieldsCount) {
        const edgeType = containmentEdges[edgeIndex + edgeTypeOffset];
        if (edgeType === edgeWeakType)
          continue;
        const childNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
        const childNodeOrdinal = childNodeIndex / nodeFieldCount;
        if (distances[childNodeOrdinal] !== noDistance)
          continue;
        edge.edgeIndex = edgeIndex;
        if (filter && !filter(node, edge))
          continue;
        distances[childNodeOrdinal] = distance;
        nodesToVisit[nodesToVisitLength++] = childNodeIndex;
      }
    }
    if (nodesToVisitLength > nodeCount) {
      throw new Error(
        'BFS failed. Nodes to visit (' + nodesToVisitLength + ') is more than nodes count (' + nodeCount + ')');
    }
  }


  rootNode() {
    return this.createNode(this.rootNodeIndex);
  }

  private _userObjectsMapAndFlag() {
    return { map: this.flags, flag: this.nodeFlags.pageObject };
  }

  private _isEssentialEdge(nodeIndex, edgeType) {
    // Shortcuts at the root node have special meaning of marking user global objects.
    return edgeType !== this.edgeWeakType &&
      (edgeType !== this.edgeShortcutType || nodeIndex === this.rootNodeIndex);
  }

  createNode(nodeIndex) {
    return new HeapSnapshotNode(this, nodeIndex === undefined ? -1 : nodeIndex);
  }

  isUserRoot(node: HeapSnapshotNode) {
    return node.isUserRoot() || node.isDocumentDOMTreesRoot();
  }

  private _buildPostOrderIndex() {
    const nodeFieldCount = this.nodeFieldCount;
    const nodeCount = this.nodeCount;
    const rootNodeOrdinal = this.rootNodeIndex / nodeFieldCount;

    const edgeFieldsCount = this.edgeFieldsCount;
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const containmentEdges = this.containmentEdges;

    const mapAndFlag = this._userObjectsMapAndFlag();
    const flags = mapAndFlag ? mapAndFlag.map : null;
    const flag = mapAndFlag ? mapAndFlag.flag : 0;

    const stackNodes = new Uint32Array(nodeCount);
    const stackCurrentEdge = new Uint32Array(nodeCount);
    const postOrderIndex2NodeOrdinal = new Uint32Array(nodeCount);
    const nodeOrdinal2PostOrderIndex = new Uint32Array(nodeCount);
    const visited = new Uint8Array(nodeCount);
    let postOrderIndex = 0;

    let stackTop = 0;
    stackNodes[0] = rootNodeOrdinal;
    stackCurrentEdge[0] = firstEdgeIndexes[rootNodeOrdinal];
    visited[rootNodeOrdinal] = 1;

    let iteration = 0;
    while (true) {
      ++iteration;
      while (stackTop >= 0) {
        const nodeOrdinal = stackNodes[stackTop];
        const edgeIndex = stackCurrentEdge[stackTop];
        const edgesEnd = firstEdgeIndexes[nodeOrdinal + 1];

        if (edgeIndex < edgesEnd) {
          stackCurrentEdge[stackTop] += edgeFieldsCount;
          const edgeType = containmentEdges[edgeIndex + edgeTypeOffset];
          if (!this._isEssentialEdge(nodeOrdinal * nodeFieldCount, edgeType)) {
            continue;
          }
          const childNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
          const childNodeOrdinal = childNodeIndex / nodeFieldCount;
          if (visited[childNodeOrdinal]) {
            continue;
          }
          const nodeFlag = !flags || (flags[nodeOrdinal] & flag);
          const childNodeFlag = !flags || (flags[childNodeOrdinal] & flag);
          // We are skipping the edges from non-page-owned nodes to page-owned nodes.
          // Otherwise the dominators for the objects that also were retained by debugger would be affected.
          if (nodeOrdinal !== rootNodeOrdinal && childNodeFlag && !nodeFlag) {
            continue;
          }
          ++stackTop;
          stackNodes[stackTop] = childNodeOrdinal;
          stackCurrentEdge[stackTop] = firstEdgeIndexes[childNodeOrdinal];
          visited[childNodeOrdinal] = 1;
        } else {
          // Done with all the node children
          nodeOrdinal2PostOrderIndex[nodeOrdinal] = postOrderIndex;
          postOrderIndex2NodeOrdinal[postOrderIndex++] = nodeOrdinal;
          --stackTop;
        }
      }

      if (postOrderIndex === nodeCount || iteration > 1) {
        break;
      }
      const errors = [
        `Heap snapshot: ${nodeCount - postOrderIndex} nodes are unreachable from the root. Following nodes have only weak retainers:`
      ];
      const dumpNode = this.rootNode();
      // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
      // visited after all orphan nodes and their subgraphs.
      --postOrderIndex;
      stackTop = 0;
      stackNodes[0] = rootNodeOrdinal;
      stackCurrentEdge[0] = firstEdgeIndexes[rootNodeOrdinal + 1];  // no need to reiterate its edges
      for (let i = 0; i < nodeCount; ++i) {
        if (visited[i] || !this._hasOnlyWeakRetainers(i)) {
          continue;
        }

        // Add all nodes that have only weak retainers to traverse their subgraphs.
        stackNodes[++stackTop] = i;
        stackCurrentEdge[stackTop] = firstEdgeIndexes[i];
        visited[i] = 1;

        dumpNode.nodeIndex = i * nodeFieldCount;
        const retainers = [];
        for (let it = dumpNode.retainers(); it.hasNext(); it.next()) {
          retainers.push(`${it.item().node().name()}@${it.item().node().id()}.${it.item().name()}`);
        }
        // errors.push(`${dumpNode.name()} @${dumpNode.id()}  weak retainers: ${retainers.join(', ')}`);
      }

      logger.warn(errors.join(''));
    }

    // If we already processed all orphan nodes that have only weak retainers and still have some orphans...
    if (postOrderIndex !== nodeCount) {
      const errors = [`Still found ${nodeCount - postOrderIndex} unreachable nodes in heap snapshot:`];
      const dumpNode = this.rootNode();
      // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
      // visited after all orphan nodes and their subgraphs.
      --postOrderIndex;
      for (let i = 0; i < nodeCount; ++i) {
        if (visited[i]) {
          continue;
        }
        dumpNode.nodeIndex = i * nodeFieldCount;
        // errors.push(dumpNode.name() + ' @' + dumpNode.id());
        // Fix it by giving the node a postorder index anyway.
        nodeOrdinal2PostOrderIndex[i] = postOrderIndex;
        postOrderIndex2NodeOrdinal[postOrderIndex++] = i;
      }
      nodeOrdinal2PostOrderIndex[rootNodeOrdinal] = postOrderIndex;
      postOrderIndex2NodeOrdinal[postOrderIndex++] = rootNodeOrdinal;

      logger.warn(errors.join(''));
    }

    return {
      postOrderIndex2NodeOrdinal: postOrderIndex2NodeOrdinal,
      nodeOrdinal2PostOrderIndex: nodeOrdinal2PostOrderIndex
    };
  }

  private _hasOnlyWeakRetainers(nodeOrdinal) {
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeWeakType = this.edgeWeakType;
    const edgeShortcutType = this.edgeShortcutType;
    const containmentEdges = this.containmentEdges;
    const retainingEdges = this.retainingEdges;
    const beginRetainerIndex = this.firstRetainerIndex[nodeOrdinal];
    const endRetainerIndex = this.firstRetainerIndex[nodeOrdinal + 1];
    for (let retainerIndex = beginRetainerIndex; retainerIndex < endRetainerIndex; ++retainerIndex) {
      const retainerEdgeIndex = retainingEdges[retainerIndex];
      const retainerEdgeType = containmentEdges[retainerEdgeIndex + edgeTypeOffset];
      if (retainerEdgeType !== edgeWeakType && retainerEdgeType !== edgeShortcutType) {
        return false;
      }
    }
    return true;
  }

  private _buildDominatorTree(postOrderIndex2NodeOrdinal, nodeOrdinal2PostOrderIndex) {
    const nodeFieldCount = this.nodeFieldCount;
    const firstRetainerIndex = this.firstRetainerIndex;
    const retainingNodes = this.retainingNodes;
    const retainingEdges = this.retainingEdges;
    const edgeFieldsCount = this.edgeFieldsCount;
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const firstEdgeIndexes = this.firstEdgeIndexes;
    const containmentEdges = this.containmentEdges;
    const rootNodeIndex = this.rootNodeIndex;

    const mapAndFlag = this._userObjectsMapAndFlag();
    const flags = mapAndFlag ? mapAndFlag.map : null;
    const flag = mapAndFlag ? mapAndFlag.flag : 0;

    const nodesCount = postOrderIndex2NodeOrdinal.length;
    const rootPostOrderedIndex = nodesCount - 1;
    const noEntry = nodesCount;
    const dominators = new Uint32Array(nodesCount);
    for (let i = 0; i < rootPostOrderedIndex; ++i) {
      dominators[i] = noEntry;
    }
    dominators[rootPostOrderedIndex] = rootPostOrderedIndex;

    // The affected array is used to mark entries which dominators
    // have to be racalculated because of changes in their retainers.
    const affected = new Uint8Array(nodesCount);
    let nodeOrdinal;

    // Mark the root direct children as affected.
    nodeOrdinal = this.rootNodeIndex / nodeFieldCount;
    const endEdgeIndex = firstEdgeIndexes[nodeOrdinal + 1];
    for (let edgeIndex = firstEdgeIndexes[nodeOrdinal]; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
      const edgeType = containmentEdges[edgeIndex + edgeTypeOffset];
      if (!this._isEssentialEdge(this.rootNodeIndex, edgeType))
        continue;
      const childNodeOrdinal = containmentEdges[edgeIndex + edgeToNodeOffset] / nodeFieldCount;
      affected[nodeOrdinal2PostOrderIndex[childNodeOrdinal]] = 1;
    }


    let changed = true;
    while (changed) {
      changed = false;
      for (let postOrderIndex = rootPostOrderedIndex - 1; postOrderIndex >= 0; --postOrderIndex) {
        if (affected[postOrderIndex] === 0) {
          continue;
        }
        affected[postOrderIndex] = 0;
        // If dominator of the entry has already been set to root,
        // then it can't propagate any further.
        if (dominators[postOrderIndex] === rootPostOrderedIndex) {
          continue;
        }
        nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
        const nodeFlag = !flags || (flags[nodeOrdinal] & flag);
        let newDominatorIndex = noEntry;
        const beginRetainerIndex = firstRetainerIndex[nodeOrdinal];
        const endRetainerIndex = firstRetainerIndex[nodeOrdinal + 1];
        let orphanNode = true;
        for (let retainerIndex = beginRetainerIndex; retainerIndex < endRetainerIndex; ++retainerIndex) {
          const retainerEdgeIndex = retainingEdges[retainerIndex];
          const retainerEdgeType = containmentEdges[retainerEdgeIndex + edgeTypeOffset];
          const retainerNodeIndex = retainingNodes[retainerIndex];
          if (!this._isEssentialEdge(retainerNodeIndex, retainerEdgeType))
            continue;
          orphanNode = false;
          const retainerNodeOrdinal = retainerNodeIndex / nodeFieldCount;
          const retainerNodeFlag = !flags || (flags[retainerNodeOrdinal] & flag);
          // We are skipping the edges from non-page-owned nodes to page-owned nodes.
          // Otherwise the dominators for the objects that also were retained by debugger would be affected.
          if (retainerNodeIndex !== rootNodeIndex && nodeFlag && !retainerNodeFlag) {
            continue;
          }
          let retanerPostOrderIndex = nodeOrdinal2PostOrderIndex[retainerNodeOrdinal];
          if (dominators[retanerPostOrderIndex] !== noEntry) {
            if (newDominatorIndex === noEntry) {
              newDominatorIndex = retanerPostOrderIndex;
            } else {
              while (retanerPostOrderIndex !== newDominatorIndex) {
                while (retanerPostOrderIndex < newDominatorIndex) {
                  retanerPostOrderIndex = dominators[retanerPostOrderIndex];
                }
                while (newDominatorIndex < retanerPostOrderIndex) {
                  newDominatorIndex = dominators[newDominatorIndex];
                }
              }
            }
            // If idom has already reached the root, it doesn't make sense
            // to check other retainers.
            if (newDominatorIndex === rootPostOrderedIndex)
              break;
          }
        }
        // Make root dominator of orphans.
        if (orphanNode)
          newDominatorIndex = rootPostOrderedIndex;
        if (newDominatorIndex !== noEntry && dominators[postOrderIndex] !== newDominatorIndex) {
          dominators[postOrderIndex] = newDominatorIndex;
          changed = true;
          nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
          const beginEdgeToNodeFieldIndex = firstEdgeIndexes[nodeOrdinal] + edgeToNodeOffset;
          const endEdgeToNodeFieldIndex = firstEdgeIndexes[nodeOrdinal + 1];
          for (let toNodeFieldIndex = beginEdgeToNodeFieldIndex; toNodeFieldIndex < endEdgeToNodeFieldIndex;
            toNodeFieldIndex += edgeFieldsCount) {
            const childNodeOrdinal = containmentEdges[toNodeFieldIndex] / nodeFieldCount;
            affected[nodeOrdinal2PostOrderIndex[childNodeOrdinal]] = 1;
          }
        }
      }
    }

    const dominatorsTree = new Uint32Array(nodesCount);
    for (let postOrderIndex = 0, l = dominators.length; postOrderIndex < l; ++postOrderIndex) {
      nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
      dominatorsTree[nodeOrdinal] = postOrderIndex2NodeOrdinal[dominators[postOrderIndex]];
    }
    return dominatorsTree;
  }

  private _calculateRetainedSizes(postOrderIndex2NodeOrdinal) {
    const nodeCount = this.nodeCount;
    const nodes = this.nodes;
    const nodeSelfSizeOffset = this.nodeSelfSizeOffset;
    const nodeFieldCount = this.nodeFieldCount;
    const dominatorsTree = this.dominatorsTree;
    const retainedSizes = this.retainedSizes;

    for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) {
      retainedSizes[nodeOrdinal] = nodes[nodeOrdinal * nodeFieldCount + nodeSelfSizeOffset];
    }

    // Propagate retained sizes for each node excluding root.
    for (let postOrderIndex = 0; postOrderIndex < nodeCount - 1; ++postOrderIndex) {
      const nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
      const dominatorOrdinal = dominatorsTree[nodeOrdinal];
      retainedSizes[dominatorOrdinal] += retainedSizes[nodeOrdinal];
    }
  }

  private _buildDominatedNodes() {
    // Builds up two arrays:
    //  - "dominatedNodes" is a continuous array, where each node owns an
    //    interval (can be empty) with corresponding dominated nodes.
    //  - "indexArray" is an array of indexes in the "dominatedNodes"
    //    with the same positions as in the _nodeIndex.
    const indexArray = this.firstDominatedNodeIndex;
    // All nodes except the root have dominators.
    const dominatedNodes = this.dominatedNodes;

    // Count the number of dominated nodes for each node. Skip the root (node at
    // index 0) as it is the only node that dominates itself.
    const nodeFieldCount = this.nodeFieldCount;
    const dominatorsTree = this.dominatorsTree;

    let fromNodeOrdinal = 0;
    let toNodeOrdinal = this.nodeCount;
    const rootNodeOrdinal = this.rootNodeIndex / nodeFieldCount;
    if (rootNodeOrdinal === fromNodeOrdinal) {
      fromNodeOrdinal = 1;
    } else if (rootNodeOrdinal === toNodeOrdinal - 1) {
      toNodeOrdinal = toNodeOrdinal - 1;
    } else {
      throw new Error('Root node is expected to be either first or last');
    }

    for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
      ++indexArray[dominatorsTree[nodeOrdinal]];
    }

    // Put in the first slot of each dominatedNodes slice the count of entries
    // that will be filled.
    let firstDominatedNodeIndex = 0;
    for (let i = 0, l = this.nodeCount; i < l; ++i) {
      const dominatedCount = dominatedNodes[firstDominatedNodeIndex] = indexArray[i];
      indexArray[i] = firstDominatedNodeIndex;
      firstDominatedNodeIndex += dominatedCount;
    }
    indexArray[this.nodeCount] = dominatedNodes.length;
    // Fill up the dominatedNodes array with indexes of dominated nodes. Skip the root (node at
    // index 0) as it is the only node that dominates itself.
    for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
      const dominatorOrdinal = dominatorsTree[nodeOrdinal];
      let dominatedRefIndex = indexArray[dominatorOrdinal];
      dominatedRefIndex += (--dominatedNodes[dominatedRefIndex]);
      dominatedNodes[dominatedRefIndex] = nodeOrdinal * nodeFieldCount;
    }
  }

  get totalSize() {
    return this.rootNode().retainedSize();
  }

  private _calculateStatistics() {
    const nodeFieldCount = this.nodeFieldCount;
    const nodes = this.nodes;
    const nodesLength = nodes.length;
    const nodeTypeOffset = this.nodeTypeOffset;
    const nodeSizeOffset = this.nodeSelfSizeOffset;
    const nodeNativeType = this.nodeNativeType;
    const nodeCodeType = this.nodeCodeType;
    const nodeConsStringType = this.nodeConsStringType;
    const nodeSlicedStringType = this.nodeSlicedStringType;
    const distances = this.nodeDistances;
    let sizeNative = 0;
    let sizeCode = 0;
    let sizeStrings = 0;
    let sizeJSArrays = 0;
    let sizeSystem = 0;
    const node = this.rootNode();
    for (let nodeIndex = 0; nodeIndex < nodesLength; nodeIndex += nodeFieldCount) {
      const nodeSize = nodes[nodeIndex + nodeSizeOffset];
      const ordinal = nodeIndex / nodeFieldCount;
      if (distances[ordinal] >= baseSystemDistance) {
        sizeSystem += nodeSize;
        continue;
      }
      const nodeType = nodes[nodeIndex + nodeTypeOffset];
      node.nodeIndex = nodeIndex;
      if (nodeType === nodeNativeType) {
        sizeNative += nodeSize;
      }
      else if (nodeType === nodeCodeType) {
        sizeCode += nodeSize;
      }
      else if (nodeType === nodeConsStringType || nodeType === nodeSlicedStringType || node.type() === 'string') {
        sizeStrings += nodeSize;
      }
      else if (node.name() === 'Array') {
        sizeJSArrays += this._calculateArraySize(node);
      }
    }
    this.statistics = new Statistics();
    this.statistics.total = this.totalSize;
    this.statistics.v8heap = this.totalSize - sizeNative;
    this.statistics.native = sizeNative;
    this.statistics.code = sizeCode;
    this.statistics.jsArrays = sizeJSArrays;
    this.statistics.strings = sizeStrings;
    this.statistics.system = sizeSystem;
  }

  private _calculateArraySize(node: HeapSnapshotNode) {
    let size = node.selfSize();
    const beginEdgeIndex = node.edgeIndexesStart();
    const endEdgeIndex = node.edgeIndexesEnd();
    const containmentEdges = this.containmentEdges;
    const strings = this.strings;
    const edgeToNodeOffset = this.edgeToNodeOffset;
    const edgeTypeOffset = this.edgeTypeOffset;
    const edgeNameOffset = this.edgeNameOffset;
    const edgeFieldsCount = this.edgeFieldsCount;
    const edgeInternalType = this.edgeInternalType;
    for (let edgeIndex = beginEdgeIndex; edgeIndex < endEdgeIndex; edgeIndex += edgeFieldsCount) {
      const edgeType = containmentEdges[edgeIndex + edgeTypeOffset];
      if (edgeType !== edgeInternalType) {
        continue;
      }
      const edgeName = strings[containmentEdges[edgeIndex + edgeNameOffset]];
      if (edgeName !== 'elements') {
        continue;
      }
      const elementsNodeIndex = containmentEdges[edgeIndex + edgeToNodeOffset];
      node.nodeIndex = elementsNodeIndex;
      if (node.retainersCount() === 1) {
        size += node.selfSize();
      }
      break;
    }
    return size;
  }
}

export {
  HeapSnapshot,
  HeapSnapshotNode
}
