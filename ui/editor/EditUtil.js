export default class EditUtil {

  originalData;
  edits = {};
  touched = [];
  setEdits;

  constructor({data, setEdits}) {
    if (!data) data = {}; // protect against null data
    console.debug(`Create EditUtil.`);
    this.originalData = data;
    this.setEdits = setEdits;
    this.edits = {...data}
    setEdits({...data});
    console.debug(`Edits: ${JSON.stringify(this.edits)}`);
  }

  onDataChanged({name, value, changes}) {
    if (changes && Array.isArray(changes)) {
      for (const change of changes) {
        this.onDataChanged(change);
      }
    } else if (name) {
      console.debug(`EditUtil.onDataChanged: {name:${name} value: ${value}}.`);
      if ((value === undefined || value === null) && this.edits[name]) {
        delete this.edits[name];
      } else {
        this.edits[name] = value;
      }
      this.touched.push(name);
      this.setEdits({...this.edits});
      console.debug(`Edits: ${JSON.stringify(this.edits)}`);
    }
  }

  /**
   * Update the data, i.e. after a DynamoDB update.
   * @param data {Object} data being edited.
   */
  update(data) {
    this.originalData = data;
    this.edits = {...data};
    this.touched = [];
    this.setEdits({...data});
  }

  isTouched(name) {
    if (name) {
      return this.touched.includes(name);
    }
  }

  isDataChanged() {
    return JSON.stringify(this.edits) !== JSON.stringify(this.originalData);
  }

  revert() {
    this.edits = {...this.originalData}
    this.touched = [];
    this.setEdits({...this.originalData});
  }
}