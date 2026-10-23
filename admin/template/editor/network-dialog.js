import { picture, translate } from './data.js';

export class PhotoSphereEditorNetworkDialog extends HTMLDialogElement {

    connectedCallback() {
        this.classList.add('photo-sphere-editor-dialog');

        this.#render();

        this.querySelector('[data-close]').addEventListener('click', () => this.close());
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
            url: `/ws.php?format=json&method=psv.getLinks`,
            dataType: 'json',
            data: {
                image_id: picture().id,
                recursive: true,
            },
        });

        this.#buildNetwork(result);
    }

    /**
     * @param {import('./data.js').Link[]} links
     * @link https://observablehq.com/@brunolaranjeira/d3-v6-force-directed-graph-with-directional-straight-arrow
     */
    async #buildNetwork(links) {
        const div = this.querySelector('#network-graph');

        div.replaceChildren();
        if (links.length === 0) {
            return;
        }

        const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm');
        const nodesById = new Map();

        nodesById.set(parseInt(picture().id), {
            id: parseInt(picture().id),
            image: picture().square_url,
            label: picture().name,
        });

        links.forEach(link => {
            if (!nodesById.has(link.dst_id)) {
                nodesById.set(link.dst_id, {
                    id: link.dst_id,
                    image: link.square.url,
                    label: link.title || link.name,
                });
            }
        });

        links.forEach(link => {
            if (!nodesById.has(link.src_id)) {
                nodesById.set(link.src_id, {
                    id: link.src_id,
                    image: null,
                    label: String(link.src_id),
                });
            }
        });

        const nodes = [...nodesById.values()];
        const linkedPairs = new Set(links.map(link => `${link.src_id}:${link.dst_id}`));
        const edges = links.map(link => ({
            source: link.src_id,
            target: link.dst_id,
            bidirectional: linkedPairs.has(`${link.dst_id}:${link.src_id}`),
        }));

        const width = div.clientWidth;
        const height = div.clientHeight;
        const radius = 32;
        
        const svg = d3.select(div)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('role', 'img')
            .attr('aria-label', 'Photo link network');

        const defs = svg.append('defs');
        
        [
            { id: 'green-arrow', color: '#6ece5e' },
            { id: 'orange-arrow', color: '#ffa646' },
        ].forEach(({ id, color }) => {
            defs.append('marker')
                .attr('id', id)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 9)
                .attr('markerWidth', 10)
                .attr('markerHeight', 10)
                .attr('orient', 'auto')
                .attr('markerUnits', 'userSpaceOnUse')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', color);
        });

        defs.selectAll('clipPath')
            .data(nodes)
            .join('clipPath')
            .attr('id', node => `clip-${node.id}`)
            .append('circle')
            .attr('r', radius);

        const edge = svg.append('g')
            .selectAll('path')
            .data(edges)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', link => link.bidirectional ? '#6ece5e' : '#ffa646')
            .attr('stroke-width', 2)
            .attr('marker-end', link => `url(#${link.bidirectional ? 'green-arrow' : 'orange-arrow'})`);

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', 'network-graph-node')
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
            .attr("y", radius + 15)
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        node.filter(d => d.image)
            .append('image')
            .attr('x', -radius)
            .attr('y', -radius)
            .attr('width', radius * 2)
            .attr('height', radius * 2)
            .attr('href', d => d.image)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', d => `url(#clip-${d.id})`);

        node.append('circle')
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(radius * 4))
            .force('charge', d3.forceManyBody().strength(-350))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(radius + 12))
            .on('tick', () => {
                edge.attr('d', link => {
                    const dx = link.target.x - link.source.x;
                    const dy = link.target.y - link.source.y;
                    const distance = Math.hypot(dx, dy) || 1;
                    const ux = dx / distance;
                    const uy = dy / distance;

                    return `M${link.source.x + ux * radius},${link.source.y + uy * radius}` +
                        `L${link.target.x - ux * radius},${link.target.y - uy * radius}`;
                });
                node.attr('transform', d => `translate(${d.x},${d.y})`);
            });
    }
}

customElements.define('photo-sphere-editor-network-dialog', PhotoSphereEditorNetworkDialog, { extends: 'dialog' });
