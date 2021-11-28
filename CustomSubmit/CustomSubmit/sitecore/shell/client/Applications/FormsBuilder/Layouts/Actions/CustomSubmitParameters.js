(function (speak) {
    var parentApp = window.parent.Sitecore.Speak.app.findApplication('EditActionSubAppRenderer'),
        designBoardApp = window.parent.Sitecore.Speak.app.findComponent('FormDesignBoard');

    var getFields = function () {
        var fields = designBoardApp.getFieldsData();

        return _.reduce(fields,
            function (memo, item) {
			
                if (item && item.model && item.model.hasOwnProperty("value")) {
                    memo.push({
                        itemId: item.itemId,
                        name: item.model.name
                    });
                }
                return memo;
            },
            [
                {
                    itemId: '',
                    name: ''
                }
            ],
            this);
    };

    speak.pageCode(["underscore"],
        function (_) {
            return {
                initialized: function () {
                    this.on({
                        "loaded": this.loadDone
                    },
                        this);

                    this.Fields = getFields();
                    
					this.MapForm1.children.forEach(function (control) {
                        if (control.deps && control.deps.indexOf("bclSelection") !== -1) {
                            control.IsSelectionRequired = false;
                        }
                    });
					
					this.MapForm2.children.forEach(function (control) {
                        if (control.deps && control.deps.indexOf("bclSelection") !== -1) {
                            control.IsSelectionRequired = false;
                        }
                    });
					
                    if (parentApp) {
                        parentApp.loadDone(this, this.HeaderTitle.Text, this.HeaderSubtitle.Text);
                        parentApp.setSelectability(this, true);
                    }
                },

                setDynamicData: function (propKey) {
                    var componentName = this.MapForm2.bindingConfigObject[propKey].split(".")[0];
                    var component = this.MapForm2[componentName];

                    var items = this.Fields.slice(0);
                   
					if (propKey == 'StaticDataAndFormFields') //Static Data And Form Fields (Case 3) - This field only, should have below custom  static data and the form fields
					{
						items.shift(); // removing unnecessary first element
						items.splice(0,0,{itemId: 'Static data 1 value', name: 'Static data 1'}, {itemId: 'Static data 2 value', name: 'Static data 2'});	//adding these 2 options.
					}
					component.DynamicData = items;				
                },

                loadDone: function (parameters) {
                    this.Parameters = parameters || {};
					_.keys(this.MapForm2.bindingConfigObject).forEach(this.setDynamicData.bind(this));
                    this.MapForm2.BindingTarget = this.Parameters; //Sets the saved value on the form
					this.MapForm1.BindingTarget = this.Parameters;
                },

                getData: function () {
                    var formData = this.MapForm2.getFormData(),
                        keys = _.keys(formData);

                    keys.forEach(function (propKey) {
                        if (formData[propKey] == null || formData[propKey].length === 0) {
                            if (this.Parameters.hasOwnProperty(propKey)) {
                                delete this.Parameters[propKey];
                            }
                        } else {
                            this.Parameters[propKey] = formData[propKey];
                        }
                    }.bind(this));
					
					 var formData = this.MapForm1.getFormData(),
                        keys = _.keys(formData);

                    keys.forEach(function (propKey) {
                        if (formData[propKey] == null || formData[propKey].length === 0) {
                            if (this.Parameters.hasOwnProperty(propKey)) {
                                delete this.Parameters[propKey];
                            }
                        } else {
                            this.Parameters[propKey] = formData[propKey];
                        }
                    }.bind(this));
                    return this.Parameters; //this function gets values selected on the both the MapForm1 and MapForm2 and returns. Sitecore framework takes care of saving the value to database at submit action item - Parameters field.
                }
            };
        });
})(Sitecore.Speak);
