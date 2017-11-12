import axios from 'axios'
import stringifyFichiers from './stringifyFichiers'

const object = {
  prénom: 'Marie',
  lastname: 'Jane',
  address: {
    street: 'Pestalozzi',
    number: 5
  }
}

function create(mandat, key) {
  return axios({
    method: 'put',
    url: `https://first-cluster-2026533573.eu-central-1.bonsaisearch.net/mandats/mandat/${key}`,
    data: {
      code: mandat.code,
      nom: mandat.nom,
      arrivée: mandat.arrivée,
      délai: mandat.délai,
      type: mandat.type,
      activité: mandat.activité,
      TAO: mandat.TAO,
      source: mandat.source,
      cible: mandat.cible,
      traducteur: mandat.traducteur,
      réviseur: mandat.réviseur,
      heure: mandat.heure,
      priorité: mandat.priorité,
      public_cible: mandat.public_cible,
      centre_coûts: mandat.centre_coûts,
      remarque: mandat.remarque,
      département: mandat.mandant.département,
      mandant: mandat.mandant.text,
      fichiers: stringifyFichiers(mandat.fichiers)
    },
    auth: {
      username: 'sl729fctsq',
      password: 'tslh5y1zel'
    }
  })
}

async function search(query) {
  const response = await axios.get(
    'https://first-cluster-2026533573.eu-central-1.bonsaisearch.net/_search',
    {
      params: {
        source: query
        // I found this online:
        /* 
        source: JSON.stringify(query),
        source_content_type: 'application/json'
        */
      },
      auth: {
        username: 'sl729fctsq',
        password: 'tslh5y1zel'
      }
    }
  )
  return response.data.hits.hits
}

export { create, search }