'use strict';

/*
 * Created with @iobroker/create-adapter v1.23.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require('fs');

class Alexawecker extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'alexawecker',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('objectChange', this.onObjectChange.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);




		this.basicStatesCreate();


		// The adapters config (in the instance object everything under the attribute 'native') is accessible via
		// this.config:
		this.log.info('config option1: ' + this.config.option1);
		this.log.info('config option2: ' + this.config.amount);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named 'testVariable'
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/

	}

	async getAllRooms(){
		const allRooms = {};
		const rooms = await this.getEnumAsync('rooms');
		if (!rooms) {

			console.log(`Cannot get room data`);
		} else {

			const raeume  = rooms.result;
			let arrayIndex = 0;
			for (const room in raeume){
				console.log(raeume[room].common.name);
				allRooms[arrayIndex] = raeume[room].common.name;
				arrayIndex = arrayIndex + 1;
			}
		}

		console.log(allRooms);
		return allRooms;
	}

	async basicStatesCreate(){
		console.log(`basicStatesCreate stare`);

		const radiosenderSettings = this.config.devices;
		const radiosender = {};
		if (!radiosenderSettings || radiosenderSettings !== []){
			for (const i in radiosenderSettings) {
				console.log(radiosenderSettings[i]);
				radiosender[i] = radiosenderSettings[i].Sender;
			}

		}
		
		console.log(JSON.stringify(radiosender));
		this.log.info(JSON.stringify(radiosenderSettings));
		const raum = await this.getAllRooms();
		
	
		const amount = parseInt(this.config.amount);
		for (let position = 1; position <= amount; position++) {
			
			const stateID = position <10 ? '0' + position : position; 

			await this.extendObjectAsync(`${stateID}.Alexa_Lautstaerke`, {
				type: 'state',
				common: {
					name: 'Alexa_Lautstaerke', 
					type: 'number', 
					def: 10
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Licht`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Licht', 
					type: 'boolean', 
					def: false
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Minuten`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Minuten', 
					type: 'number', 
					def: 0,
					min: 0,
					max: 59
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Radio`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Radio', 
					type: 'boolean', 
					def: false
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Stunde`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Stunde', 
					type: 'number', 
					def: 0,
					min: 0,
					max: 23
				},
				native: {},
			});


			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Sender_auswahl`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Sender_auswahl', 
					type: 'string', 
					states: radiosender       
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_aktiv`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_aktiv', 
					type: 'boolean', 
					def: false
				},
				native: {},
			});

			await this.extendObjectAsync(`${stateID}.Alexa_Geraet_auswahl`, {
				type: 'state',
				common: {
					name: 'Alexa_Geraet_auswahl', 
					type: 'string', 
					states: raum
				},
				native: {},
			});

		}
		this.setState('info.connection', true, true);

	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info('cleaned everything up...');
			this.setState('info.connection', false, true);
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires 'common.message' property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Alexawecker(options);
} else {
	// otherwise start the instance directly
	new Alexawecker();
}