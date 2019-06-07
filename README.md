# @appt/sequelize
This is a plugin made for Appt that wraps [Sequelize ORM](https://www.npmjs.com/package/sequelize) to work into the *Appt's ecosystem* with advanced *database models and schemes*. 

We assume you got here after seeing the [Appt's Core](https://www.npmjs.com/package/@appt/core) session of main concepts. If you don't, **we strongly recommend** you to step back an take a 5 minutes reading to get used with some key concepts we're going to apply here.


## Install
    $ npm install @appt/sequelize --save

 
## Resources
The `@appt/sequelize` plugin export some resources which can be imported as seen below:
```javascript
import {
   Sequelize,
   sequelize,
   TModel,
   TSchema,
   SchemaProperties
} from '@appt/sequelize';
```

### Sequelize
AR the example below, we have a component that needs to act as a database connector of an application. By default, an Appt component is just a class with a "signature" that it can be injected by other class. As our component here needs to a specific behavior, we need to make use of a *Special-Type Extender* called *TDatabase*. This special type makes part of the [@appt/core](https://www.npmjs.com/package/@appt/core#apptcore) package and it indicates our component should act as a database connector, but it does not know *how or which kind of database to connect*. That's why we need to use a *"driver"*, which here is *"Sequelize"*R At this point, you only need to provide the `uri` connection and, if you need a little more configuration, pass into options attribute any param allowed by the sequelize connection.
```javascript
import { Component, TDatabase } from '@appt/core';
import { Sequelize } from '@appt/sequelize';

const config = {
  uri: `postgres://localhost:5432/sqlz`,
  options: {
    logging: true
  }
}

@Component({
	extend: TDatabase(Sequelize, Ronfig.uri, config.options)
})
export class AppDatabase{}
```

### TModel
This Special-Type Extender add the Sequelize model behavior to our component. That means once imported by another component (or even inside the model), any *sequelize* query method can be accessed into the class context. After define the type as a TModel component, the sequelize model expect to has a `sequelize schema` as first param. You also can add any configuration allowed for a sequelize models by passing them as second param.
```javascript
import { Component } from '@appt/core';
import { TModel } from '@appt/sequelize';

@Component({
	extend: TModel('AppShema')
})
export class MyModel {
	constructor()
	{
	}

	static getById(_id){
		return this.findOne({ _id });
	}
}
```

### TSchema
The special type to transform a component into a `Sequelize Schema`. All the configurations accepted by sequelize can be passed through it (`TSchema(config)`).
```javascript
import { Component } from '@appt/core';
import { TSchema } from '@appt/sequelize';

@Component({
	extend: TSchema
})
export class AppShema {
	constructor(){
		this.name = {}

		this.email = {}
	}
}
```

### SchemaTypes
This is an Appt interface for Sequelize ORM schema types. It exposes every type available in Sequelize.
```javascript
import { SchemaTypes } from '@appt/sequelize';
...
	this._id = {}
...
```

## Compatibility
**We're using ES6 features!** Which means you gonna need to compile your code to work with current versions of **NodeJs**. Thankfully, there's a lot of tools out there doing that, such as [babel](https://babeljs.io/).
You might also want to work with **TypeScript**. If you do, check the *experimental decorators support* option to start coding.


## That's all folks!
If you have any suggestion or want to contribute somehow, let me know!


## License
```

MIT License

  

Copyright (c) 2017 Rodrigo Brabo

  

Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:

  

The above copyright notice and this permission notice shall be included in all

copies or substantial portions of the Software.

  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE

SOFTWARE.

```
