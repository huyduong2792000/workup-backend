define(function(require) {
	return class ObjectRefactor {
		constructor() {
			return "hello world";
		};
		
		static getCorrectValueType(inputObject, schema) {
			if (!inputObject || !schema) {
				throw "getCorrectValueType: Two arguments are required";
			}
			var keyNames = Object.keys(schema);
			keyNames.forEach(function(property) {
				if (inputObject[property] === null) {
					// TODO
				} else if (schema[property].type === "string") {
					inputObject[property] = String(inputObject[property]);
				} else if (schema[property].type === "number") {
					inputObject[property] = parseInt(inputObject[property]);
				} else if (schema[property].type === "boolean") {
					if (inputObject[property] && (inputObject[property] === true || inputObject[property] === "true")) {
						inputObject[property] = true;
					} else {
						inputObject[property] = false;
					}
				}else if (schema[property].type === "dict") {
					// TODO
				} else if (schema[property].type === "list") {
					// TODO
				}
			});
			return JSON.parse(JSON.stringify(inputObject));
		}
		
		static mergeObject(target, source, override=false) {
			if (!target || !source) {
				throw "mergeObject: At least two arguments are required";
			}
			var sourceKeys = Object.keys(source);
			sourceKeys.forEach(function(property) {
				if (override === true) {
					target[property] = source[property];
				} else {
					if (!target.hasOwnProperty(property)) {
						target[property] = source[property];
					}
				}
			});
		}
	}
});