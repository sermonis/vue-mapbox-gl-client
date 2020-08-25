export default {

    methods: {

        /**
        ** @private
        **/
        _registerPublicMethods () {

            this.map.disable = this.disable();

        }, // _registerPublicMethods

        /**
        ** @private
        **/
        _updateSyncedPropsFabric ( prop, data ) {

            return () => {

                this.propsIsUpdating[ prop ] = true;

                let info = typeof data === 'function' ? data() : data;

                return this.$emit( `update:${ prop }`, info );

            };

        }, // _updateSyncedPropsFabric

        /**
        ** @private
        **/
        _bindPropsUpdateEvents () {

            const syncedProps = [

                {
                    events: [ 'moveend' ],
                    prop: 'center',
                    getter: this.map.getCenter.bind( this.map ),
                },

                {
                    events: [ 'zoomend' ],
                    prop: 'zoom',
                    getter: this.map.getZoom.bind( this.map ),
                },

                {
                    events: [ 'rotate' ],
                    prop: 'bearing',
                    getter: this.map.getBearing.bind( this.map ),
                },

                {
                    events: [ 'pitch' ],
                    prop: 'pitch',
                    getter: this.map.getPitch.bind( this.map ),
                },

                /**
                ** TODO: make 'bounds' synced prop.
                ** { events: [ 'moveend', 'zoomend', 'rotate', 'pitch' ], prop: 'bounds', getter: this.map.getBounds.bind( this.map ) }
                **/

            ]; // syncedProps

            syncedProps.forEach( ( { events, prop, getter } ) => {

                events.forEach( event => {

                    if ( this.$listeners[ `update:${ prop }` ] ) {

                        this.map.on( event, this._updateSyncedPropsFabric( prop, getter ) );

                    }

                } ); // forEach

            } ); // forEach

        }, // _bindPropsUpdateEvents

        /**
        ** @private
        **/
        _loadMap () {

            return this.mapboxPromise.then( mapbox => {

                this.mapbox = mapbox.default ? mapbox.default : mapbox;

                return new Promise( resolve => {

                    if ( this.accessToken ) {

                        this.mapbox.accessToken = this.accessToken;

                    }

                    const map = new this.mapbox.Map( {

                        ...this._props,
                        container: this.$refs.container,
                        style: this.mapStyle,

                    } ); // map

                    map.on( 'load', () => resolve( map ) );

                } ); // Promise

            } ); // return

        }, // _loadMap

        /**
        ** @private
        **/
        _RTLTextPluginError ( error ) {

            this.$emit( 'rtl-plugin-error', { map: this.map, error: error } );

        }, // _RTLTextPluginError

        /**
        ** @private
        **/
        _bindMapEvents ( events ) {

            Object.keys(this.$listeners).forEach( eventName => {

                if ( events.includes( eventName ) ) {

                    this.map.on( eventName, this._emitMapEvent );

                }

            } );

        }, // _bindMapEvents

        /**
        ** @private
        **/
        _unbindEvents ( events ) {

            events.forEach( eventName => {

                this.map.off( eventName, this._emitMapEvent );

            } );

        }, // _unbindEvents

    }, // methods

}; // export default
