import { gotoImage, picture, rootUrl, translate } from './data.js';

const LINK_COLOR = new Map();
LINK_COLOR.set(true, '#6baed6');
LINK_COLOR.set(false, '#ffa646');

const NODE_RADIUS = 30;

export class PhotoSphereEditorDialogNetwork extends HTMLDialogElement {
    /** @type {HTMLElement} */
    #graphContainer = null;
    /** @type {HTMLElement} */
    #loader = null;

    #edges = null;
    #simulation = null;

    connectedCallback() {
        this.classList.add('photo-sphere-editor-dialog');

        this.#render();

        this.#graphContainer = this.querySelector('#network-graph');
        this.#loader = this.querySelector('.loader');

        this.querySelector('[data-close]').addEventListener('click', () => {
            this.#graphContainer.replaceChildren();
            this.close();
        });
    }

    #render() {
        this.innerHTML = `
        <header>
            <h3>${translate('Network')}</h3>

            <button class="buttonLike" title="${translate('Close')}" data-close>
                <i class="icon-cancel"></i>
            </button>
        </header>
        
        <div class="loader">
            <img src="${rootUrl()}themes/default/images/ajax_loader.gif">
        </div>

        <div id="network-graph"></div>
        `;
    }

    loadAndShow() {
        this.#loadData();
        this.showModal();
    }

    /**
     * @param {import('./data.js').Link} link
     */
    removeLink(link) {
        const matchesLink = edge => edge.src_id === link.src_id && edge.dst_id === link.dst_id;

        this.#edges.filter(matchesLink).remove();
        this.#edges = this.#edges.filter(edge => !matchesLink(edge));
        this.#simulation.force('link').links(this.#edges.data());
        this.#simulation.alpha(0.3).restart();
    }

    async #loadData() {
        this.#graphContainer.replaceChildren();
        this.#loader.style.display = 'block';

        const { result } = await $.ajax({
            url: `/ws.php?format=json&method=psv.getNetwork`,
            dataType: 'json',
            data: {
                image_id: picture().id,
            },
        });

        result.links.forEach(link => {
            link.src = result.images.find(image => image.id === link.src_id);
            link.dst = result.images.find(image => image.id === link.dst_id);
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

        const edges = [];
        links.forEach(link => {
            const edge = edges.find((e) => e.source === link.dst_id && e.target === link.src_id);
            if (edge) {
                edge.bidirectional = true;
            } else {
                edges.push({
                    ...link,
                    source: link.src_id,
                    target: link.dst_id,
                    bidirectional: false,
                });
            }
        });

        const width = this.#graphContainer.clientWidth;
        const height = this.#graphContainer.clientHeight;

        const svg = d3.select(this.#graphContainer)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`);

        const defs = svg.append('defs');

        // markers for arrows
        defs.selectAll('marker')
            .data([true, false])
            .join('marker')
            .attr('id', d => `arrow-end-${d}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .attr('markerUnits', 'userSpaceOnUse')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', d => LINK_COLOR.get(d));

        defs.append('marker')
            .attr('id', 'arrow-start')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 0)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .attr('markerUnits', 'userSpaceOnUse')
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5')
            .attr('fill', LINK_COLOR.get(true));

        // clip path for thumbnails
        defs.append('clipPath')
            .attr('id', 'node-clip')
            .append('circle')
            .attr('r', NODE_RADIUS);

        // edges : line + button
        const edge = svg.append('g')
            .selectAll('path')
            .data(edges)
            .join('g')
            .attr('class', 'network-edge');

        edge.append('path')
            .attr('fill', 'none')
            .attr('stroke', link => LINK_COLOR.get(link.bidirectional))
            .attr('stroke-width', 2)
            .attr('marker-start', link => link.bidirectional ? 'url(#arrow-start)' : null)
            .attr('marker-end', link => `url(#arrow-end-${link.bidirectional})`);

        edge.append('foreignObject')
            .attr('width', 30)
            .attr('height', 30)
            .append('xhtml:button')
            .attr('type', 'button')
            .attr('class', 'network-edge__button icon-trash')
            .attr('title', translate('Delete'))
            .on('click', (_, link) => {
                this.dispatchEvent(new CustomEvent('delete-link', { detail: link }));
            });

        // nodes : image + circle + text
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

        node.append('title')
            .text(d => d.id === picture().id ? 'Current' : (!d.is_sphere ? 'Not a Photo Sphere' : null));

        node.append('text')
            .attr('x', 0)
            .attr('y', NODE_RADIUS + 15)
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .clone(true).lower()
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 3);

        node.append('image')
            .attr('x', -NODE_RADIUS)
            .attr('y', -NODE_RADIUS)
            .attr('width', NODE_RADIUS * 2)
            .attr('height', NODE_RADIUS * 2)
            .attr('href', d => d.square_url)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', 'url(#node-clip)')
            .attr('cursor', 'pointer')
            .on('click', (_, image) => {
                gotoImage(image.id);
            });

        node.append('circle')
            .attr('r', NODE_RADIUS)
            .attr('fill', 'none')
            .attr('stroke', d => d.id === picture().id ? 'var(--piwigo-color)' : (!d.is_sphere ? '#a10' : '#fff'))
            .attr('stroke-width', 2);

        // animation
        const simulation = d3.forceSimulation(images)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(NODE_RADIUS * 5))
            .force('charge', d3.forceManyBody().strength(-350).distanceMax(NODE_RADIUS * 8))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(NODE_RADIUS + 10))
            .on('tick', () => {
                edge.select('path').attr('d', link => {
                    const dx = link.target.x - link.source.x;
                    const dy = link.target.y - link.source.y;
                    const distance = Math.hypot(dx, dy) || 1;
                    const ux = dx / distance;
                    const uy = dy / distance;

                    return `M${link.source.x + ux * NODE_RADIUS},${link.source.y + uy * NODE_RADIUS}` +
                        `L${link.target.x - ux * NODE_RADIUS},${link.target.y - uy * NODE_RADIUS}`;
                });
                edge.select('foreignObject')
                    .attr('x', link => (link.source.x + link.target.x) / 2 - 13)
                    .attr('y', link => (link.source.y + link.target.y) / 2 - 13);
                node.attr('transform', d => `translate(${d.x},${d.y})`);
            });

        this.#edges = edge;
        this.#simulation = simulation;

        this.#loader.style.display = 'none';
    }
}

customElements.define('photo-sphere-editor-dialog-network', PhotoSphereEditorDialogNetwork, { extends: 'dialog' });
