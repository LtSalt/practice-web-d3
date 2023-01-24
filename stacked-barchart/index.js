// dimensions
const dim = {
    width: 600,
    height: 400,
    margin: {
        top: 20,
        right: 20,
        bottom: 50,
        left: 130
    }
}

// canvas
const svg = d3.select("#svg-container")
    .append("svg")
        .attr("width", dim.width + dim.margin.left + dim.margin.right)
        .attr("height", dim.height + dim.margin.top + dim.margin.bottom)
    .append("g")
        .attr("width", dim.width)
        .attr("height", dim.height)
        .attr("transform", `translate(${dim.margin.left}, ${dim.margin.top})`)

async function drawBars() {
  
    // load data
    const fruits = await aq.loadCSV('./data/fruits.csv')

    // reshape data
    const fruitsReshaped = fruits
        .groupby('fruit', 'tasty')
        .rollup({count: d => op.count()})
        .groupby('fruit')
        .derive({pct: d => d. count / op.sum(d.count)})
        .pivot('tasty', 'pct')
        .objects();

    // stack data
    const fruitsStacked = d3.stack()
        .keys(['yes', 'no'])
        (fruitsReshaped)

    console.table(fruitsStacked)

    // scales
    const xScale = d3.scaleBand()
        .range([0, dim.width])
        .domain(fruitsReshaped.map(d => d.fruit))
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([dim.height, 0]);

    const fillScale = d3.scaleOrdinal()
        .domain(['yes', 'no'])
        .range(["#6495ED", "#ED7864"])

    // axes

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format('~%'))

    svg.append('g')
        .call(yAxis)

    const xAxis = d3.axisBottom(xScale);

    svg.append('g')
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(0, ${dim.height})`)

 
    // draw bars
    svg.append('g')
        .selectAll('g')
        .data(fruitsStacked)
        .join('g')
            .attr('fill', d => fillScale(d.key))
            .selectAll('rect')
            .data(d => d)
            .join('rect')
                .attr('x', d => xScale(d.data.fruit))
                .attr('y', d => yScale(d[1]))
                .attr('height', d => yScale(d[0]) - yScale(d[1]))
                .attr('width', xScale.bandwidth())

    }
drawBars();