import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { MyHttpService } from './my-http-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-covid-chart',
  templateUrl: './my-covid-chart.component.html',
  styleUrls: ['./my-covid-chart.component.css']
})
export class MyCovidChartComponent implements OnInit {
  covidDelhi: any;
  covidMumbai: any;
  activeCases: any;
  confirmedCases: any;
  selectedCity = 'Maharashtra';

  covidDateSeries: Array<Object>;
  stateWiseData: Array<Object>;

  public lineChartData = [
    { data: [], label: 'Confirmed Cases' },
    { data: [], label: 'Active Cases', yAxisID: 'y-axis-1' },
  ];
  public lineChartLabels: Label[] = [];

  public lineChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          ticks: {
            fontColor: 'red',
          }
        }
      ]
    }
  };

  public lineChartColors: Color[] = [
    {
      borderColor: 'orange',
      backgroundColor: 'transparent',
    },
    {
      borderColor: 'red',
      backgroundColor: 'transparent',
    },
  ];

  public lineChartLegend = true;
  public lineChartType = 'line';

  constructor(private http: MyHttpService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.loadCovidData();
  }

  loadCovidData() {
    this.http.httpConnection('get', 'https://api.covid19india.org/data.json').subscribe((res) => {
      if (res) {
        this.covidDateSeries = res['cases_time_series'];
        this.stateWiseData = res['statewise'];
        this.setDateTimeData();
        // this.covidDelhi = res['Delhi']['districtData']['New Delhi'];
        // this.covidMumbai = res['Maharashtra']['districtData']['Mumbai'];

        // this.confirmedCases = this.covidDelhi.confirmed;
        // this.activeCases = this.covidDelhi.active;

        console.log(this.covidDateSeries);
      }
    })
  }
  //getting mock data as proper data set isn't provided in covid api 
  onChangeCity(name) {
    if (name == 'Delhi') {
      this.selectedCity = 'Delhi';
      this.httpClient.get('../../assets/covidData/delhi.json').subscribe((res) => {
        this.covidDateSeries = res['cases_time_series'];
        this.setDateTimeData();
      });
    } else {
      this.selectedCity = 'Mumbai';
      this.httpClient.get('../../assets/covidData/maharashtra.json').subscribe((res) => {
        this.covidDateSeries = res['cases_time_series'];
        this.setDateTimeData();
      });
    }
  }

  setDateTimeData() {
    let currentMonth = new Date().getMonth() - 2;
    // filtering data by month , set data after May
    let data = this.covidDateSeries.filter(x => new Date(x['date']).getMonth() > currentMonth);
    this.confirmedCases = data[data.length - 1]['totalconfirmed'];
    this.activeCases = parseInt(data[data.length - 1]['totalconfirmed']) - parseInt(data[data.length - 1]['totalrecovered'])
    this.lineChartLabels = [];
    this.lineChartData[0].data = [];
    this.lineChartData[1].data = [];
    for (let i = 0; i < data.length; i++) {
      let activeCases = parseInt(data[i]['totalconfirmed']) - parseInt(data[i]['totalrecovered']);
      this.lineChartData[0].data.push(parseInt(data[i]['dailyconfirmed']));
      this.lineChartData[1].data.push(activeCases);
      this.lineChartLabels.push(data[i]['date']);
    }
  }
}
