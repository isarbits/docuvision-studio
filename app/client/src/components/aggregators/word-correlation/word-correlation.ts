import * as d3 from 'd3';

interface Dims {
    width: number;
    height: number;
}

interface NodeDatum extends d3.SimulationNodeDatum {
    id: string;
    group: number;
    value?: number;
    name?: string;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
    source: string;
    target: string;
    value: number;
}

export interface Dataset {
    nodes: NodeDatum[];
    links: LinkDatum[];
}

const ticked = (link, node) => () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
};

const dragstarted = simulation => d => {
    if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
};

const dragged = simulation => d => {
    void simulation;
    d.fx = d3.event.x;
    d.fy = d3.event.y;
};

const dragended = simulation => d => {
    if (!d3.event.active) {
        simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
};

const createSimulation = (graph: Dataset, dims: Dims) => {
    const simulation = d3.forceSimulation();

    simulation.nodes(graph.nodes);

    simulation
        .force(
            'link',
            d3
                .forceLink<NodeDatum, LinkDatum>(graph.links)
                // .distance(20)
                .id(d => d.id),
        )
        .force('charge', d3.forceManyBody() /*.distanceMin(20)*/)
        .force('center', d3.forceCenter(dims.width / 2, dims.height / 2))
        .force(
            'collide',
            d3
                .forceCollide<NodeDatum>()
                .radius(d => 15 + d.value)
                .iterations(3),
        );

    simulation.alpha(1).restart();

    return simulation;
};

export const createNode = (div: HTMLDivElement, graph: Dataset) => {
    div = div || document.createElement('div');
    if (div.hasChildNodes) {
        div.childNodes.forEach(node => node.remove());
    }

    const width = div.clientWidth || 960;
    const height = div.clientHeight || 960;

    const svg = d3
        .select(div)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = createSimulation(graph, { width, height });

    const link = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter()
        .append('line')
        .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(graph.nodes)
        .enter()
        .append('g');

    node.append('circle')
        .attr('r', d => d.value ?? 10)
        .attr('fill', d => color(`${d.group}`))
        .call(
            d3
                .drag<SVGCircleElement, NodeDatum>()
                .on('start', dragstarted(simulation))
                .on('drag', dragged(simulation))
                .on('end', dragended(simulation)),
        );

    node.append('text')
        .text(d => d.name || d.id)
        .attr('x', 10)
        .attr('y', 3)
        .call(
            d3
                .drag<SVGTextElement, NodeDatum>()
                .on('start', dragstarted(simulation))
                .on('drag', dragged(simulation))
                .on('end', dragended(simulation)),
        );

    node.append('title').text(d => d.name || d.id);

    simulation.nodes(graph.nodes).on('tick', ticked(link, node));

    return div;
};
