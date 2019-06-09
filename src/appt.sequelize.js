import { apptEcosystem } from "@appt/core";

const Sequelize = require("sequelize");
var sequelize;

var arrSchemas = new Set();

export const getClass = function() {
  return Promise.resolve(Sequelize);
};

export const getInstance = function() {
  return Promise.resolve(sequelize);
};

function TModel(main, options = null) {
  return {
    target: ApptModel,
    args: {
      main: main,
      options: options
    }
  };
}

class ApptModel {
  constructor(extenderParams, Target, injectables) {
    return this.exec(extenderParams, Target, injectables);
  }

  normalizeComponents(component) {
    return new Promise(resolve => {
      const schemaPromise =
        typeof component === "string" ? new apptEcosystem.getEntity(component, this.targetName)() : new component();

      return schemaPromise.then(comp => resolve(comp));
    });
  }

  exec(extenderParams, Target, injectables) {
    return this.normalizeComponents(extenderParams.main)
      .then(schema => this.getSchema(schema))
      .then(entitySchema => {
        return new Promise(resolve => {
          let ModelClass = sequelize && sequelize.define(Target.name, entitySchema, extenderParams.options || {});
          ModelClass = ModelClass && Object.assign(ModelClass, { refresh: this.refresh })

          if (injectables && injectables.length > 0) {
            new Target(...injectables, ModelClass);
          } else {
            new Target(ModelClass);
          }

          resolve(ModelClass);
        });
      })
      .catch(err => console.log(err));
  }

  refresh(isConcurently = false) {
    const concurrently = isConcurently ? ' CONCURRENTLY ' : ' ';

    return sequelize.query(`
      REFRESH MATERIALIZED VIEW${concurrently}${this.options.tableName}
    `);
  }

  getSchema(mySchema) {
    const schema = mySchema.injectables
      ? new mySchema.target(...mySchema.injectables, Sequelize)
      : new mySchema.target(Sequelize);

    return Object.keys(schema).reduce((prev, crr) => {
      return Object.assign(prev, { [crr]: schema[crr] });
    }, {});
  }
}

function TSchema(args) {
  return {
    target: ApptSchema,
    args: args
  };
}

class ApptSchema {
  constructor(extenderParams, Target, injectables) {
    arrSchemas.add({
      target: Target,
      options: extenderParams || {},
      injectables: injectables
    });

    return this.exec(extenderParams, Target, injectables);
  }

  exec(extenderParams, Target, injectables) {
    return new Promise(resolve => {
      resolve({
        target: Target,
        options: extenderParams || {},
        injectables: injectables
      });
    });
  }
}

class QueryInterfaceWrap {

  constructor(sequelize, schema, options) {
    this.sequelize = sequelize;
    this.schemaOptions = options;

    this.setSchemaAttrs(schema);
  }

  setSchemaAttrs(schema){
    this.schemaAttrs = Object.keys(schema)
      .reduce((prev, key) =>
        Object.assign(prev, {
          [key]: schema[key]
        }), {});
  }

  formatArgsForTableName(args){
    if(this.schemaOptions && this.schemaOptions.tableName)
      args.unshift(this.schemaOptions.tableName);

    return args;
  }

  addColumn(...args) {
    //table: string, key: string, attribute: Object, options: Object)
    return this.sequelize.queryInterface.addColumn(...args);
  }

  addConstraint(...args) {
    //tableName: string, attributes: Array, options: Object, rawTablename: string)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.addConstraint(...newArgs);
  }

  addIndex(...args) {
    //tableName: string | Object, attributes: Array, options: Object, rawTablename: string)
    const newArgs = this.formatArgsForTableName(args);
    return this.sequelize.queryInterface.addIndex(...newArgs);
  }

  bulkDelete(...args) {
    //tableName: string, where: Object, options: Object, model: Model)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.bulkDelete(...newArgs);
  }

  bulkInsert(...args) {
    //tableName: string, records: Array, options: Object, attributes: Object)

    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.bulkInsert(...newArgs);
  }

  bulkUpdate(...args) {
    //tableName: string, values: Object, identifier: Object, options: Object, attributes: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.bulkUpdate(...newArgs);
  }

  changeColumn(...args) {
    //tableName: string, attributeName: string, dataTypeOrOptions: Object, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.changeColumn(...newArgs);
  }

  createDatabase(...args) {
    //database: string, options: Object)
    return this.sequelize.queryInterface.createDatabase(...args);
  }

  createFunction(...args) {
    //functionName: string, params, returnType: string, language: string, body: string, optionsArray, options: Object)
    return this.sequelize.queryInterface.createFunction(...args);
  }

  createSchema(...args) {
    //schema: string, options: Object)
    return this.sequelize.queryInterface.createSchema(...args);
  }

  createTable(...args) {
    //tableName: string, attributes: Object, options: Object, model)
    const newArgs = this.formatArgsForTableName(args);
    newArgs.splice(1, 0, this.schemaAttrs);

    return this.sequelize.queryInterface.createTable(...args);
  }

  createTableAs(query) {
    return this.sequelize.query(`
      CREATE TABLE ${this.schemaOptions.tableName} AS ${query}
    `);
  }

  createView(query) {
    return this.sequelize.query(`
      CREATE VIEW ${this.schemaOptions.tableName} AS ${query}
    `);
  }

  createMaterializedView(query) {
    return this.sequelize.query(`
      CREATE MATERIALIZED VIEW ${this.schemaOptions.tableName} AS ${query}
    `);
  }

  describeTable(...args) {
    //tableName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.describeTable(...newArgs);
  }

  dropAllSchemas(...args) {
    //options: Object)
    return this.sequelize.queryInterface.dropAllSchemas(...args);
  }

  dropAllTables(...args) {
    //options: Object)
    return this.sequelize.queryInterface.dropAllTables(...args);
  }

  dropDatabase(...args) {
    //database: string, options: Object)
    return this.sequelize.queryInterface.dropDatabase(...args);
  }

  dropFunction(...args) {
    //functionName: string, params, options: Object)
    return this.sequelize.queryInterface.dropFunction(...args);
  }

  dropSchema(...args) {
    //schema: string, options: Object)
    return this.sequelize.queryInterface.dropSchema(...args);
  }

  dropTable(...args) {
    //tableName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.dropTable(...newArgs);
  }

  dropView() {
    //tableName: string, options: Object)]
    return this.sequelize.query(`DROP VIEW IF EXISTS ${this.schemaOptions.tableName}`);
  }

  dropMaterializedView() {
    //tableName: string, options: Object)]
    return this.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.schemaOptions.tableName}`);
  }

  getForeignKeyReferencesForTable(...args) {
    //tableName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.getForeignKeyReferencesForTable(...args);
  }

  removeColumn(...args) {
    //tableName: string, attributeName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.removeColumn(...newArgs);
  }

  removeConstraint(...args) {
    //tableName: string, constraintName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.removeConstraint(...newArgs);
  }

  removeIndex(...args) {
    //tableName: string, indexNameOrAttributes: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.removeIndex(...newArgs);
  }

  renameColumn(...args) {
    //tableName: string, attrNameBefore: string, attrNameAfter: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.renameColumn(...newArgs);
  }

  renameFunction(...args) {
    //oldFunctionName: string, params, newFunctionName: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.renameFunction(...newArgs);
  }

  renameTable(...args) {
    //before: string, after: string, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.renameTable(...newArgs);
  }

  showAllSchemas(...args) {
    //options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.showAllSchemas(...newArgs);
  }

  upsert(...args) {
    //tableName: string, insertValues: Object, updateValues: Object, where: Object, model, options: Object)
    const newArgs = this.formatArgsForTableName(args);

    return this.sequelize.queryInterface.upsert(...newArgs);
  }
}

class ApptSequelize {

  constructor(...options) {
    this.customConfig = options.filter(opt => opt != null && opt != undefined && opt != "undefined");
  }

  exec() {
    sequelize = new Sequelize(...this.customConfig);

    return sequelize
      .sync()
      .then(() => {
        if (this.customConfig.some(opt => typeof opt != "string" && opt.migration)) {
          this.executeMigrations(this.customConfig);
        }

        return {
          sequelize: sequelize,
          config: this.customConfig
        };
      })
      .catch(err => {
        console.log(err);
      });
  }

  executeMigrations(opts) {
    const argFn = process.argv.pop();

    arrSchemas.forEach(Schema => {
      const scm = new Schema.target(Sequelize);
      const queryInterfaceWrap = new QueryInterfaceWrap(sequelize, scm, Schema.options);

      scm[argFn] && scm[argFn](queryInterfaceWrap);
    });
  }
}

export { TModel, TSchema, ApptSequelize };
