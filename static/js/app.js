var transformedSampleData;
var metaDataList;

// URL to retrieve data
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";



// Retrieve data from the URL
d3.json(url, init).then((data) => {
    init(data);

});

function init(data) {

    console.log(data);
    console.log(data['samples'].length);

    metaDataList = data.metadata;

    transformedSampleData = transformData(data);
    console.log(transformedSampleData.length);
    console.log(transformedSampleData);

    populateSubjectIdNos();

    drawBarChart(transformedSampleData[0]);

    drawBubbleChart(transformedSampleData[0]);
    
    displayDemographicInfo(metaDataList[0]);
    
}


function transformData(data) {

    //For each sample create a list of JSON objects that contains otu_id, otu_label and sample_value

    const samples = data['samples'].filter(s => s['otu_ids'].length > 0).map((s) => {
        let samples_list = [];
        for (let i = 0; i < s['otu_ids'].length; i++) {
            try {
                samples_list.push({
                    'id': s['id'],
                    'otu_id': s['otu_ids'][i],
                    'otu_label': s['otu_labels'][i],
                    'sample_value': s['sample_values'][i]
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        return samples_list;
    });

    console.log("samples=", samples);

    // Sort each sample list based on sample_value
    const samplesSorted = samples.map(s => s.sort((a, b) => { b.sample_value - a.sample_value })).filter(s => (!s.id || /^\s*$/.test(s.id)));

    // Create a sample with top ten OTUs with otu_ids, otu_labels and sample_values separated in a list
    const sampleTopTenOTUs = samplesSorted.map(s => {
        let otu_ids = [];
        let otu_labels = [];
        let sample_values = [];
        let ids = [];
        s.map(s => {
            ids.push(s['id']);
            otu_ids.push(s['otu_id']);
            otu_labels.push(s['otu_label']);
            sample_values.push(s['sample_value']);
        });
        let id = ids[0];
        return {
            'id': id,
            'otu_ids': otu_ids,
            'otu_labels': otu_labels,
            'sample_values': sample_values
        }
    });

    return sampleTopTenOTUs;
}

function populateSubjectIdNos() {
    transformedSampleData.map(data => {
        const option = d3.select("#selDataset").append("option");
        option.attr('value', data.id);
        option.text(data.id);
    });
}


function drawBarChart(sample) {

    var data = [{
        type: 'bar',
        x: sample.sample_values.slice(0,10).reverse(),
        y: sample.otu_ids.slice(0, 10).map(id => 'OTU ' + id).reverse(),
        orientation: 'h'
    }];

    Plotly.newPlot('bar', data);
}

function updateBarChart(sample) {

    Plotly.restyle("bar", "x", [sample.sample_values.slice(0,10).reverse()]);
    Plotly.restyle("bar", "y", [sample.otu_ids.slice(0,10).map(id => 'OTU ' + id).reverse()]);
}

function drawBubbleChart(sample) {

    var trace1 = {
        x: sample.otu_ids,
        y: sample.sample_values,
        mode: 'markers',
        marker: {
          size: sample.sample_values,
          color: sample.otu_ids,
          text: sample.otu_labels
        }
      };
      
      var data = [trace1];
      
      var layout = {
        xaxis: {
            title: {
              text: 'OTU ID'
            }
        },
        showlegend: false
      };
      
      Plotly.newPlot('bubble', data, layout);
      
}

function updateBubbleChart(sample) {

    Plotly.restyle("bubble", "x", [sample.otu_ids]);
    Plotly.restyle("bubble", "y", [sample.sample_values]);

    Plotly.restyle("bubble", "marker.size", [sample.sample_values]);
    Plotly.restyle("bubble", "marker.color", [sample.otu_ids]);
    Plotly.restyle("bubble", "marker.text", [sample.otu_labels]);

}

function displayDemographicInfo(metaData) {

    const table = d3.select("#sample-metadata").append('table');
    table.attr("class", "table table-borderless");
    table.attr("id", "demograhic-table");

    const tbody = table.append("tbody");

    const id = tbody.append("tr").append("td");
    id.attr("id", "demographic-id")
    id.text("id: " + metaData['id']);

    const ethnicity = tbody.append("tr").append("td");
    ethnicity.attr("id", "demographic-ethnicity")
    ethnicity.text("ethnicity: " + metaData['ethnicity']);

    const gender = tbody.append("tr").append("td");
    gender.attr("id", "demographic-gender")
    gender.text("gender: " + metaData['gender']);

    const age = tbody.append("tr").append("td");
    age.attr("id", "demographic-age")
    age.text("age: " + metaData['age']);

    const location = tbody.append("tr").append("td");
    location.attr("id", "demographic-location")
    location.text("location: " + metaData['location']);

    const bbtype = tbody.append("tr").append("td");
    bbtype.attr("id", "demographic-bbtype")
    bbtype.text("bbtype: " + metaData['bbtype']);

    const wfreq = tbody.append("tr").append("td");
    wfreq.attr("id", "demographic-wfreq")
    wfreq.text("wfreq: " + metaData['wfreq']);
}

function updateDemographicInfo(metaData) {

    d3.select("#demographic-id").text("id: " + metaData['id']);
    d3.select("#demographic-ethnicity").text("ethnicity: " + metaData['ethnicity']);
    d3.select("#demographic-gender").text("gender: " + metaData['gender']);
    d3.select("#demographic-age").text("age: " + metaData['age']);
    d3.select("#demographic-location").text("location: " + metaData['location']);
    d3.select("#demographic-bbtype").text("bbtype: " + metaData['bbtype']);
    d3.select("#demographic-wfreq").text("wfreq: " + metaData['wfreq']);

}

function optionChanged(value) {
    console.log('selected ', value);
    transformedSampleData.filter(sample => sample.id === value).map(sample => {
        updateBarChart(sample);
        updateBubbleChart(sample);
    });
    metaDataList.filter(metaData => metaData.id == value)
                .map(metaData => updateDemographicInfo(metaData));
}

