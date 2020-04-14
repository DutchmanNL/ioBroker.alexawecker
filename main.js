'use strict';

/*
 * Created with @iobroker/create-adapter v1.23.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const schedule = require('node-schedule');
const allItems = {};
const timer = {};
const radiosender = {};
const allRooms = {};

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



		await this.basicStatesCreate();
		await this.getAllStateData();		

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named 'testVariable'
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/

	}

	
	async basicStatesCreate(){
		console.log(`basicStatesCreate stare`);

		const radiosenderSettings = this.config.devices;
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

			await this.extendObjectAsync(`${stateID}.Alexa_Wecker_Licht`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Licht', 
					type: 'boolean',
					def: false 
				},
				native: {},
			});		
			
			await this.extendObjectAsync(`states.Licht.Wecker_${stateID}.Alexa_Wecker_Licht`, {
				type: 'state',
				common: {
					name: 'Alexa_Wecker_Licht', 
					type: 'string',
				},
				native: {},
			});	

			for (const room in raum) {
				await this.extendObjectAsync(`states.geraet.${raum[room]}`, {
					type: 'state',
					common: {
						name: 'Alexa Radio State', 
						type: 'string', 
					},
					native: {},
				});

				await this.extendObjectAsync(`states.lautstaerke.${raum[room]}`, {
					type: 'state',
					common: {
						name: 'Alexa Volume State', 
						type: 'string', 
					},
					native: {},
				});

			}



			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_Stunde`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_Minuten`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_aktiv`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_Licht`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_Radio`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Lautstaerke`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Geraet_auswahl`);
			this.subscribeStates(`alexawecker.0.${stateID}.Alexa_Wecker_Sender_auswahl`);


		}

		this.setState('info.connection', true, true);

	}

	async getAllRooms(){
		
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

	async getAllStateData (){
		try {
			const amount = parseInt(this.config.amount);
			for (let position = 1; position <= amount; position++) {
				const stateID = position <10 ? '0' + position : position; 
				const hours = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_Stunde`);
				if (!hours) continue;
				allItems[stateID] = {
					hours:hours.val
				};
				console.log(`Get hour for alexawecker.0.${stateID}.Alexa_Wecker_Stunde : ${hours.val}`);

				const minutes = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_Minuten`);
				if (!minutes) continue;
				allItems[stateID].minutes = minutes.val;
				console.log(`Get minutes for alexawecker.0.${stateID}.Alexa_Wecker_Minuten : ${minutes.val}`);
				const activ = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_aktiv`);
				allItems[stateID].active = !activ ? false : activ.val ;
				const lighton = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_Licht`);
				allItems[stateID].lighton = !lighton ? false : lighton.val ;
				const radioon = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_Radio`);
				allItems[stateID].radioon = !radioon ? false : radioon.val ;
				const volume = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Lautstaerke`);
				allItems[stateID].volume = !volume ? false : volume.val ;
				const room = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Geraet_auswahl`);
				allItems[stateID].room = !room ? false : room.val ;
				const station = await this.getStateAsync (`alexawecker.0.${stateID}.Alexa_Wecker_Sender_auswahl`);
				allItems[stateID].station = !station ? false : station.val ;
				await this.sheduler(stateID);
				console.log(allItems);
				//this.log.warn(`Werte für Timer ${stateID} Radioon : ${radioon.val}, Sonstige : ${sonststate.val}, Aktiv : ${activ.val}, Lautstärke : ${volume.val}, Raum: ${room.val}, Sender : ${station.val}`);
			}
		} catch (error) {
			console.error(`[sheduler error] : ${error.message}, stack: ${error.stack}`);
			this.log.error(`[sheduler error] : ${error.message}, stack: ${error.stack}`);
				
		}
	}


	async sheduler (stateID){
		try {

			if (timer[stateID]) {
				console.log(`Existing timer for ${stateID} cancelled`);
				timer[stateID].cancel();
			} else {
				console.log(`No existing timer for ${stateID} to cancel`);
			}

			if (allItems[stateID].active) {
				this.log.info(`Timer ${stateID} wird gestartet für ${allItems[stateID].hours} Uhr ${allItems[stateID].minutes}`);
				const rule = new schedule.RecurrenceRule();
				rule.hour = allItems[stateID].hours;
				rule.minute = allItems[stateID].minutes;
				// rule.second = 30; 
				timer[stateID] = schedule.scheduleJob(rule, async  () => {


					this.log.warn(`Timer ${stateID} wurde getriggert`); 

					//Licht wird bei Timer getriggert wenn state Licht = true

					if (allItems[stateID].lighton) {

						const lightstate = await this.getStateAsync(`alexawecker.0.states.Licht.Wecker_${stateID}.Alexa_Wecker_Licht`);

						if (lightstate && lightstate.val) {

							await this.setForeignStateAsync(`${lightstate.val}`, {val: true});
							this.log.warn (`Licht für Wecker ${stateID} wurde eingeschaltet.`);

						} else {
							this.log.error(`Für Licht Wecker ${stateID} ist kein Datenpunkt hinterlegt.`);
						}

					}
					

					//Radio wird bei Timer gestartet wenn state Radio = true

					if (allItems[stateID].radioon) {
						const stateName = await this.getStateAsync(`states.geraet.${allRooms[allItems[stateID].room]}`);
						const volumeName = await this.getStateAsync(`states.lautstaerke.${allRooms[allItems[stateID].room]}`);
						
						//Lautstärke wird eingestellt
						if (volumeName && volumeName.val) {

							await this.setForeignStateAsync (`${volumeName.val}`, {val: allItems[stateID].volume});

						} else {
							this.log.error(`Für ${allRooms[allItems[stateID].room]} Lautstärke ist kein Datenpunkt hinterlegt `);
						}
						
						//Sender wird nach 2 Sekunden eingestellt
						setTimeout( async () => {

							if (stateName && stateName.val) {

								await this.setForeignStateAsync (`${stateName.val}`, {val: radiosender[allItems[stateID].station]});

							} else {
								this.log.error(`Für ${allRooms[allItems[stateID].room]} Sender ist kein Datenpunkt hinterlegt `);
							}

						}, 2000);

					}


				
				});	

			} else {
				console.log(`Timer ${stateID} wurde nicht gestartet.`);
			}



		} catch (error) {
			console.error(`[sheduler error] : ${error.message}, stack: ${error.stack}`);
			this.log.error(`[sheduler error] : ${error.message}, stack: ${error.stack}`);
				
		}
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
			this.getAllStateData();
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