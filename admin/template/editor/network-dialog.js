import { picture, translate } from './data.js';

const LINK_COLOR = new Map();
LINK_COLOR.set(true, '#6ece5e');
LINK_COLOR.set(false, '#ffa646');

const NODE_RADIUS = 30;

export class PhotoSphereEditorNetworkDialog extends HTMLDialogElement {
    /** @type {HTMLElement} */
    #graphContainer = null;

    connectedCallback() {
        this.classList.add('photo-sphere-editor-dialog');

        this.#render();

        this.#graphContainer = this.querySelector('#network-graph');

        this.querySelector('[data-close]').addEventListener('click', () => {
            this.#graphContainer.replaceChildren();
            this.close();
        });
    }

    #render() {
        this.innerHTML = `
        <h3>${translate('Network')}</h3>

        <div id="network-graph"></div>

        <button class="buttonLike" data-close>
            <i class="icon-cancel"></i>
            ${translate('Close')}
        </button>
        `;
    }

    /**
     * @param {import('./data.js').Link} link
     */
    async showAndLoad(link) {
        this.#loadData();

        this.showModal();
    }

    async #loadData() {
        const { result } = await $.ajax({
            url: `/ws.php?format=json&method=psv.getNetwork`,
            dataType: 'json',
            data: {
                image_id: picture().id,
            },
        });

        this.#buildNetwork(result.images, result.links);
    }

    /**
     * @param {import('./data.js').Image[]} images
     * @param {import('./data.js').Link[]} links
     * @link https://observablehq.com/@brunolaranjeira/d3-v6-force-directed-graph-with-directional-straight-arrow
     */
    async #buildNetwork(images, links) {
        if (images.length === 0) {
            return;
        }

        const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm');

        const linkedPairs = new Set(links.map(link => `${link.src_id}:${link.dst_id}`));
        const edges = links.map(link => ({
            source: link.src_id,
            target: link.dst_id,
            bidirectional: linkedPairs.has(`${link.dst_id}:${link.src_id}`),
        }));

        const width = this.#graphContainer.clientWidth;
        const height = this.#graphContainer.clientHeight;

        const svg = d3.select(this.#graphContainer)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`);

        const defs = svg.append('defs');

        defs.selectAll('marker')
            .data([true, false])
            .join('marker')
            .attr('id', d => `arrow-${d}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 9)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .attr('markerUnits', 'userSpaceOnUse')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', d => LINK_COLOR.get(d));

        defs.selectAll('clipPath')
            .data(images)
            .join('clipPath')
            .attr('id', node => `clip-${node.id}`)
            .append('circle')
            .attr('r', NODE_RADIUS);

        const edge = svg.append('g')
            .selectAll('path')
            .data(edges)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', link => `${LINK_COLOR.get(link.bidirectional)}`)
            .attr('stroke-width', 2)
            .attr('marker-end', link => `url(#arrow-${link.bidirectional})`);

        const node = svg.append('g')
            .selectAll('g')
            .data(images)
            .join('g')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        node.append("text")
            .attr("x", 0)
            .attr("y", NODE_RADIUS + 15)
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        node.append('image')
            .attr('x', -NODE_RADIUS)
            .attr('y', -NODE_RADIUS)
            .attr('width', NODE_RADIUS * 2)
            .attr('height', NODE_RADIUS * 2)
            .attr('href', d => d.square_url)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', d => `url(#clip-${d.id})`);

        node.append('circle')
            .attr('r', NODE_RADIUS)
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        const simulation = d3.forceSimulation(images)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(NODE_RADIUS * 4))
            .force('charge', d3.forceManyBody().strength(-350))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(NODE_RADIUS + 12))
            .on('tick', () => {
                edge.attr('d', link => {
                    const dx = link.target.x - link.source.x;
                    const dy = link.target.y - link.source.y;
                    const distance = Math.hypot(dx, dy) || 1;
                    const ux = dx / distance;
                    const uy = dy / distance;

                    return `M${link.source.x + ux * NODE_RADIUS},${link.source.y + uy * NODE_RADIUS}` +
                        `L${link.target.x - ux * NODE_RADIUS},${link.target.y - uy * NODE_RADIUS}`;
                });
                node.attr('transform', d => `translate(${d.x},${d.y})`);
            });
    }
}

customElements.define('photo-sphere-editor-network-dialog', PhotoSphereEditorNetworkDialog, { extends: 'dialog' });
