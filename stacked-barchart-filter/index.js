// dimensions
const dim = {
    width: 700,
    height: 500,
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}

// canvas
const svg = d3.select('#svg-container')
    .append('svg')
    .attr('width', dim.width)
    .attr('height', dim.height)
    .attr('class', 'canvas')
    .append('g')
        .attr('width', dim.width - dim.margin.left - dim.margin.right)
        .attr('height', dim.height - dim.margin.top - dim.margin.bottom)
        .attr('transform', `translate(${dim.margin.top}, ${dim.margin.left})`)


async function createChart() {

    // load data
    const fruits = await d3.csv('./data/fruits.csv');

    // create scales
    const xScale = d3.scaleBand()
        .domain(fruits.map(d => d.fruit))
        .range([0, dim.width - dim.margin.left - dim.margin.right])

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([dim.height - dim.margin.top - dim.margin.bottom, 0]);


    // could be using bools instead
    const fillFlavor = d3.scaleOrdinal()
        .domain('tasty', 'yucky')
        .range(['#4E79A7FF', '#F28E2BFF'])
   
    const fillCost = d3.scaleOrdinal()
        .domain('expensive', 'reasonable')
        .range(['#F28E2BFF', '#499894']) // object constancy only guaranteed when order reversed - why?

    const toggle = document.querySelector('input[name=filter]'); 
    let filter = toggle.value;

    const bars = svg.append('g')


    // all dynamic elements in function
    function drawBars(filter) {

        let fill;
        let keys;

        if (filter === 'flavor') {
            fill = fillFlavor;
            keys = ['tasty', 'yucky']
        } else {
            fill = fillCost;
            keys = ['expensive', 'reasonable']
        }

        // reshape data
        const fruitsReshaped = aq.from(fruits)
            .groupby('fruit', filter)
            .count()
            .groupby('fruit')
            .derive({pct: d => d.count / op.sum(d.count)})
            .pivot(filter, 'pct')   
            .objects()

        const fruitsStacked = d3.stack()
            .keys(keys)
            (fruitsReshaped)
            console.table(fruits)
            console.table(fruitsReshaped)
            console.table(fruitsStacked)
        
        // draw bars
        bars
        .selectAll('g')
        .data(fruitsStacked, d => d.index)
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
                    .attr('x', d => xScale(d.data.fruit))
                    .attr('y', d => yScale(d[1]) || 0) // 0 as fallback for undefined values
                    .attr('height', d => yScale(d[0]) - yScale(d[1]) || 0) 
                    .attr('width', xScale.bandwidth()),
                update => update 
                    .transition()
                    .delay(200)
                    .duration(500)
                    .attr('x', d => xScale(d.data.fruit))
                    .attr('y', d => yScale(d[1]) || 0)
                    .attr('height', d => yScale(d[0]) - yScale(d[1]) || 0)
                    .attr('width', xScale.bandwidth())
            )
    };

    // call function once
    drawBars(filter);

    // call function when user changes filter
    const toggles = document.querySelector('#toggles');
    toggles.addEventListener('mousedown', function(e) {
        const newFilter = e.target.attributes.for.value;
        if(filter !== newFilter) {
            filter = newFilter;
            const labels = document.querySelectorAll('.toggle');
            labels.forEach(label => label.classList.toggle('active'));
            drawBars(filter);
        }
    })
}

createChart();