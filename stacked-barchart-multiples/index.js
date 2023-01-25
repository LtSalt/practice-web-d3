const dim = {
    width: 600,
    height: 200
}

const now = d3.select('#now')
    .append('svg')
            .attr('width', dim.width)
            .attr('height', dim.height)

const buttons = document.querySelector('#buttons')

async function createChart() {
    
    // load data
    const products = await d3.csv('./data/products.csv')
    
    // create Scales
    const xScale = d3.scaleBand()
        .domain(products.map(d => d.discounter))
        .range([0, dim.width]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([dim.height, 0]);

    const fillScaleQuality = d3.scaleOrdinal()
        .domain(['fairtrade', 'normal'])
        .range(['#59A14FFF', '#F28E2BFF'])

    const fillScalePrice = d3.scaleOrdinal()
        .domain(['affordable', 'expensive'])
        .range(['#4E79A7FF', '#F28E2BFF'])


    let filter = document.querySelector('.active').attributes.id.value;
    let fill;
    let keys;
    const mainBars = now.append('g')
        .attr('class', 'mainBars');
    const labels = now.append('g')
        .attr('class', 'labels')

    // dynamic displays
    function drawMainBars(filter) {

        // fillScale and keys dependent on current filter value
        if (filter === 'quality') {
            fill = fillScaleQuality;
            keys = ['fairtrade', 'normal'];
        } else {
            fill = fillScalePrice
            keys = ['affordable', 'expensive']
        }
        
        // reshapeData
        const productsAggregated = aq.from(products)
            .filter(d => d.time === '2023')
            .groupby('discounter', filter)
            .count()
            .groupby('discounter')
            .derive({pct: d => d.count / open.sum(d.count)})
            .pivot(filter, 'pct')
            .objects()

        

        console.table(productsAggregated);

        const productsStacked = d3.stack()
            .keys(keys)
            (productsAggregated)

        // console.table(productsStacked)
        // console.log(mainBars)

        // draw bars
        mainBars
            .selectAll('g')
            .data(productsStacked, d => d.index)
            .join(
                enter => enter
                    .append('g')
                    .attr('fill', d => fill(d.key)),
                update => update
                    .transition()
                    .delay(200)
                    .duration(500)
                    .attr('fill', d => fill(d.key))
            )
            .selectAll('rect')
            .data(d => d)
            .join(
                enter => enter
                    .append('rect')
                    .attr('x', d => xScale(d.data.discounter))
                    .attr('y', d => yScale(d[1]) || 0)
                    .attr('height', d => yScale(d[0]) - yScale(d[1]) || 0) 
                    .attr('width', xScale.bandwidth())
                    .attr('class', d => d.data.discounter),
                update => update 
                    .transition()
                    .delay(200)
                    .duration(500)
                    .attr('x', d => xScale(d.data.discounter))
                    .attr('y', d => yScale(d[1]) || 0)
                    .attr('height', d => yScale(d[0]) - yScale(d[1]) || 0)
                    .attr('width', xScale.bandwidth())
            )

        labels 
            .selectAll('text')
            .data(productsAggregated)
            .join('text')
                .attr('x', d => xScale(d.discounter) + xScale.bandwidth() / 2)
                .attr('y', 100)
                .attr('width', xScale.bandwidth())
                .text(d => d.discounter)  
                .attr('class', d => d.discounter) 
    }

    drawMainBars(filter);

    // add event listeners
    buttons.addEventListener('click', function(e) {
        const newFilter = e.target.attributes.id.value;
        // console.log(e.target.attributes.id.value)

        if (filter !== newFilter) {
            filter = newFilter;

            for(const button of buttons.children) {
                button.classList.toggle('active')
            }
            drawMainBars(filter);

        }

    })
    // console.log(now)
    const container = document.querySelector('#now') ;
    console.log(container)
    // hover effects
    container.addEventListener('mouseover', function(e) {
        const hoveredOver = e.target.tagName
        if(hoveredOver === 'rect') {
            targetClass = e.target.classList.value;
            document.querySelectorAll('rect')
                .forEach(rect => rect.classList.remove('highlight'))

            document.querySelectorAll(`.${targetClass}`)
                .forEach(el => el.classList.add('highlight'))
        } 
    })



}

createChart();
