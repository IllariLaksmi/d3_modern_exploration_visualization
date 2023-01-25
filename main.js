const margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#bar_chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const barsGroup = svg.append("g").attr("class", "barsGroup");

const axisGroup = svg.append("g").attr("class", "axisGroup");

const xAxisGroup = axisGroup
    .append("g").attr("class", "xAxisGroup")
    .attr("transform", `translate(${margin.left}, ${height - margin.bottom - margin.top})`)

const yAxisGroup = axisGroup
    .append("g").attr("class", "yAxisGroup")
    .attr("transform", `translate(${margin.left}, ${0})`)


let x = d3.scaleLinear().range([0, width - margin.left - margin.right])
let y = d3.scaleBand().range([height - margin.top - margin.bottom, 0]).padding(.1)

const xAxis = d3.axisBottom().scale(x).ticks(5)
const yAxis = d3.axisLeft().scale(y)

svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height - 10) + ")")
    .style("text-anchor", "middle")
    .text("Won cups");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 15)
    .style("text-anchor", "middle")
    .text("Country");


let years;
let winners;
let originalData;

d3.csv("data.csv").then(data => {
    data.map(d => {
        d.year = +d.year
    })
    data = data.filter(d => d.winner != "")

    originalData = data
    years = data.map(d => +d.year)
    winners = d3.groups(data, d => d.winner).map((value) => value = { key: value[0], values: value[1] })
    x.domain([0, d3.max(winners.map(d => d.values.length))])
    y.domain(winners.map(d => d.key))

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    updateData(winners)
    slider()
})

const barsStructure = (bars, max) => {
    return bars
        .attr("class", d => d.values.length == max ? "bar max" : "bar")
        .attr("height", y.bandwidth())
        .attr("x", margin.left)
        .attr("y", d => y(d.key))
        .transition()
        .duration(200)
        .attr("width", d => x(d.values.length))
}

const updateData = (data) => {
    let max = d3.max(data.map(d => d.values.length))
    let bars = barsGroup.selectAll("rect").data(data)

    barsStructure(bars.enter().append("rect"), max)
    barsStructure(bars, max)

    bars.exit()
        .transition()
        .duration(100)
        .attr("width", 0)
}

const yearFilter = (year) => {
    let updatedData = originalData.filter(d => d.year <= year)
    updatedData = d3.groups(updatedData, d => d.winner)
        .map((value) => value = { key: value[0], values: value[1] })
    return updatedData
}

// slider:
const slider = () => {
    const sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  // cada cuánto aumenta el slider
        .width(580)  // ancho de nuestro slider
        .ticks(years.length)
        .default(years[years.length - 1])  // punto inicio de la marca
        .on('onchange', value => {
            d3.select("p#value-time").text(value);
            updateData(yearFilter(value))
        });

    const gTime = d3
        .select('div#slider-time')  // div donde lo insertamos
        .append('svg')
        .attr('width', width * 0.8)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(sliderTime.value());
}