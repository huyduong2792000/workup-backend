define(function(require) {
	
	return class ChartHelper {

		constructor() {
			this.c3 = c3;
			return;
		};
		
		generatePieChart(El, columns=null) {
			var chart = c3.generate({
				bindto: El,
			    data: {
			        // iris data from R
			        columns: [
			            ['loading...', 100]
			        ],
			        type : 'pie',
			        onclick: function (d, i) { console.log("onclick", d, i); },
			        onmouseover: function (d, i) {
			        	
			        },
			        onmouseout: function (d, i) {
			        	
			        }
			    }
			});

			if (!!columns && columns !== []) {
				this.c3.load({
					columns: columns
				});
			}

		};
		
		loadData(options) {
			this.c3.load(options);
			this.c3.unload({
		        ids: ['loading...']
		    });
		}
		
	}
});