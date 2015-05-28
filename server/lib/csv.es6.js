CSV = {
  exportConfig : {
    delimiter : ",",
    newline : "\n",
    header : true
  }
};

CSV.export = (data) => {
  // If we don't stripe out input data's prototype,
  // we could be exporting those methods into the CSV as well.
  let sanitized = CSV.sanitizeJSON(data);
  return Baby.unparse(sanitized, CSV.exportConfig);
};

CSV.sanitizeJSON = (unsanitizedJSON)=> {
  return JSON.parse(JSON.stringify(unsanitizedJSON));
};