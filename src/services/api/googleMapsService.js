import { googleMapsClient } from '../../config/googleMaps.js'
import 'dotenv/config';
import worldCountries from 'world-countries';

export async function obtenerPaisesDisponibles() {
    return worldCountries
        .map(pais => {
            const codigoTelefono = pais.idd?.root
            ? `${pais.idd.root}${pais.idd.suffixes?.[0] || ''}`
            : null;
            
            return {
                nombre: pais.name.common,  
                codigo: pais.cca2,         
                codigoTelefono,
            };
        });
}

export async function validarDireccion(ubicacion) {
    try {
        
        const respuesta = await googleMapsClient.geocode({
            params: {
                address: `${ubicacion.direccion}, ${ubicacion.ciudad}, ${ubicacion.provincia}, ${ubicacion.pais}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        console.log(respuesta.data.results[0])

        if (respuesta.data.status === "OK") {

            const resultado = respuesta.data.results[0];

            let calle;
            let numero;
            let pais;
            let provincia;
            let ciudad;
            let codigo;

            for (const component of resultado.address_components) {
                for (const tipo of component.types) {
                    switch (tipo) {
                        case 'country':
                            pais = component.long_name;
                            break;
                        case 'administrative_area_level_1':
                            provincia = component.long_name;
                            break;
                        case 'locality':
                            ciudad = component.long_name;
                            break;
                        case 'postal_code':
                            codigo = component.long_name;
                            break;
                        case 'route':
                            calle = component.long_name;
                            break;
                        case 'street_number':
                            numero = component.long_name;
                            break;
                    }
                }
            }

            if (!calle || !numero || !ciudad || !provincia || !pais) {
                return {
                    esValida: false,
                    motivo: "Dirección no válida"
                };
            }

            return {
                esValida: true,
                datosUbicacion: {
                    direccion : `${calle} ${numero}`,
                    calle: calle,
                    numero: numero,
                    pais: pais,
                    provincia: provincia,
                    ciudad: ciudad,
                    codigo: codigo,
                    placeid: resultado.place_id,
                    latitud: resultado.geometry.location.lat,
                    longitud: resultado.geometry.location.lng
                }
            };
        }
        else {
            return {
                esValida: false,
                motivo: respuesta.data.status
            };
        }
    } catch (error) {
        console.error("Error al consultar Google Maps:", error.message);
        throw new Error("Fallo en el servicio de mapas");
    }
}

