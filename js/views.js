var spinnerOptions = {
	lines: 12, // The number of lines to draw
	length: 1, // The length of each line
	width: 4, // The line thickness
	radius: 10, // The radius of the inner circle
	color: '#000', // #rgb or #rrggbb
	speed: 1, // Rounds per second
	trail: 60, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false // Whether to use hardware acceleration
};

var btnLabel = {
	day: "to today",
	week: "to this week",
	month: "to this month",
	year: "to this year"
}

var CalendarListSelectOptionItem = Backbone.View.extend({
	tagName: 'option',
	render: function() {
		$(this.el).html(this.model.getTitle());
		$(this.el).attr("value", this.model.cid);
		return this;
	}
});

var RangeChangeBtns = Backbone.View.extend({
	events: {
		'click a#prev': 'changeRangePrev',
		'click a#reset': 'changeRangeReset',
		'click a#next': 'changeRangeNext'
	},
	initialize: function() {
		this.model.bind('change:range', this.update, this);
	},
	render: function() {
		$(this.el).css("display", "none");
		$(this.el).css("text-align", "center");
		$(this.el).addClass("btn-group");
		$(this.el).html( _.template($('#rangeChangeBtns').html())({to:"", disableBtns:null}) );
		return this;
	},
	disableBtns: false,
	update: function(model, value) {
		$(this.el).css("display", "block");
		var middleBtnLabel = btnLabel[value] || "";
		this.disableBtns = value === "total";
		$(this.el).html( _.template($('#rangeChangeBtns').html())({to:middleBtnLabel, disableBtns:this.disableBtns}) );
	},
	changeRangePrev: function(evt) {
		evt.preventDefault();
		if(this.disableBtns) return;
		this.model.changeRange(-1);
	},
	changeRangeReset: function(evt) {
		evt.preventDefault();
		if(this.disableBtns) return;
		this.model.changeRange(0);
	},
	changeRangeNext: function(evt) {
		evt.preventDefault();
		if(this.disableBtns) return;
		this.model.changeRange(1);
	}
});

var CalendarSelectList = Backbone.View.extend({
	tagName: 'select',
	events: {
		'change': 'removePleaseSelect'
	},
	render: function() {
		$(this.el).css("display", "none");
		$(this.el).css("width", "100%");
		$(this.el).attr("id", "calList");
		$(this.el).append("<option value='' selected='selected' id='pleaseSelect'>Please select calendar</option>");
		return this;
	},
	removePleaseSelect: function(evt) {
		$(this.el).find("#pleaseSelect").remove();
	},
	updateView: function(cid) {
		$(this.el).val(cid);
	},
	calendarsReceived: function(collection) {
		$(this.el).css("display", "block");
		_(collection.models).each(function(item) {
			var optionItem = new CalendarListSelectOptionItem({
				model: item
			});

			$(this.el).append(optionItem.render().el);
		},
		this);
	}
});

var Output = Backbone.View.extend({
	render: function() {
		return this;
	},
	updateView: function(data) {
		var hours = Math.round(data.hours*100)/100;
		var rangeObj = data.range;
		var html = "<div class='hours'>" + hours + "h</div><div class='hoursrange'>";
		
		if (rangeObj.type === "day") {
			html += rangeObj.start.toString('dddd, MMMM d, yyyy');
		} else if (rangeObj.type === "week") {
			html += rangeObj.start.toString('dd.MM.yyyy') + " - " + rangeObj.end.toString('dd.MM.yyyy');
		} else if (rangeObj.type === "month") {
			html += rangeObj.start.toString('MMMM, yyyy');
		} else if (rangeObj.type === "year") {
			html += rangeObj.start.toString('yyyy');
		}

		html += "</div>"

		$(this.el).html(html);
	},
	showSpinner: function() {
		var spinnerContainer = $("<div id='spinnerContainer' style='position:relative; left:150px; top:40px;'></div>");
		var spinner = spinnerContainer.spin(spinnerOptions);
		$(this.el).html(spinnerContainer);
	}
});

var RangeSelectList = Backbone.View.extend({
	initialize: function() {
		this.model.bind('change:range', this.update, this);
	},
	render: function() {
		$(this.el).css("display", "none");
		$(this.el).append("<select id='rangeList' style='width:100%'><option value='day'>Day</option><option value='week'>Week</option><option value='month'>Month</option><option value='year'>Year</option><option value='total'>Total</option></select>")
		return this;
	},
	update: function(model, value) {
		if(!value) return;
		$(this.el).css("display", "block");
		$(this.el).find("#rangeList").val(value);
	}
});

var CalendarPrevNextBtn = Backbone.View.extend({
	render: function() {
		$(this.el).html(this.options.label);
		$(this.el).attr("id", this.options.label);
		$(this.el).attr("class", "btn small");
		$(this.el).attr("href", "");
		return this;
	},
	updateView: function(model, value) {
		if(value) {
			$(this.el).css("color", "black");
		} else {
			$(this.el).css("color", "grey");
		}
	}
});
var Options = Backbone.View.extend({
	initialize: function() {
		this.model.bind('change:range', this.update, this);
	},
	render: function() {
		var model = this.model;
		$(this.el).html('Week starts on: <label class="radio inline"><input type="radio" name="optionsRadios" id="optionsRadios1" value="option1" checked="checked">Sunday</label><label class="radio inline"><input type="radio" name="optionsRadios" id="optionsRadios2" value="option2">Monday</label>');
		$(this.el).find("#optionsRadios1").change(function() {
			model.updateWeekStart("sunday");
		});
		$(this.el).find("#optionsRadios2").change(function() {
			model.updateWeekStart("monday");
		});
		$(this.el).css("display", "none");
		return this;
	},
	update: function(model, value) {
		if(value === "week") {
			$(this.el).css("display", "block");
		} else {
			$(this.el).css("display", "none");
		}
	}
});