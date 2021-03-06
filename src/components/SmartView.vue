<template>
    <v-container fluid grid-list-md>
        <v-snackbar top v-model="snackbar.showSnack"><span class="title">{{snackbar.message}}</span></v-snackbar>

        <v-dialog v-model="liquideMandatDialog" max-width="500px">

          <v-card class="stepCard">
          <v-card-title>
   
            <div class="headline">Veux-tu liquider à jamais ce mandat ?</div>
            <span class="subheading">Cette action est irréversible.</span>

        </v-card-title>
            <v-card-actions>
            <v-btn flat color="info" @click="liquideMandat">Oui, l'expédier illico dans les archives</v-btn>
          <v-btn flat @click="liquideMandatDialog = false">Non, pas encore</v-btn>
            </v-card-actions>
          </v-card>

        </v-dialog>


        <v-layout justify-center v-if="isLoading">
            <v-progress-circular indeterminate color="primary" id="progress-circular" :width="7" :size="70" class="mt-5"></v-progress-circular>
        </v-layout>

        <v-layout row wrap v-else justify-center>

            <v-flex xs10 v-if="!mesMandats.length">
   <blockquote>Man kann sogar behaupten, dass eine Übersetzung um so abweichender wird, je mühsamer sie nach Treue strebt.
                    <footer>
                        <small>
                            <em>&mdash; Wilhelm von Humboldt</em>
                        </small>
                    </footer>
                </blockquote>
            </v-flex>

            <v-flex xs12>

            <transition-group :name="animation" tag="v-layout" class="smartView">

                <mandat :mandat="mandat" @questions="updateQuestions($event, mandat)" @setStatut="setStatut($event, mandat)" @successCopy="snackBarClipboard" @newRemarque="saveRemarque($event, mandat)" v-for="mandat in mesMandats" :key="mandat.code" ></mandat>

            </transition-group>
            </v-flex>

        </v-layout>
        <v-layout>

<v-flex xs7 v-for="failedMandat in failedMandats" :key="failedMandat.nom">
  <h3 class="title">Une erreur est survenue et le mandat {{failedMandat.code}} n'a pu être enregistré dans Google Sheets : </h3>
      <mandat-details :mandat="failedMandat"></mandat-details>
</v-flex>
        </v-layout>

    </v-container>
</template>

<script>
import { db, auth } from '../firebase'
import { create } from '@/js/axios'
import bus from '@/js/bus'
import Mandat from '@/components/Mandat'
import MandatDetails from './MandatDetails.vue'

export default {
  data: () => ({
    animation: 'roll',
    snackbar: {},
    isLoading: true,
    liquideMandatDialog: false,
    me: auth.currentUser.displayName,
    activeMandat: {},
  }),
  firebase: {
    failedMandats: db.ref('errors'),
  },
  computed: {
    mesMandats() {
      return this.mandats.filter(
        trad =>
          trad.traducteur === this.me ||
          (trad.réviseur === this.me && trad.statut === 'À réviser')
      )
    },
  },
  methods: {
    updateQuestions(newBool, mandat) {
      const key = mandat['.key']
      this.$firebaseRefs.mandats.child(`${key}/questions`).set(newBool)
    },
    setStatut(newStatut, mandat) {
      const key = mandat['.key']

      if (newStatut === 'Liquider le mandat') {
        this.liquideMandatDialog = true
        this.activeMandat = mandat
        return
      }
      this.$firebaseRefs.mandats.child(`${key}/statut`).set(newStatut)
    },
    liquideMandat() {
      const charge = this.activeMandat.chargeTravail
      let shape = 'rect'
      let durée = 3000
      let colors = ['red', 'pink', '#ba0000']
      if (charge === 8) {
        shape = 'circle'
        durée = 4000
        colors = ['#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9']
      }
      if (charge === 12) {
        shape = 'heart'
        durée = 6000
        colors = null // uses the default colors
      }
      if (charge > 4) {
        this.dropConfetti(shape, durée, colors)
      }

      this.animation = 'fold'
      this.liquideMandatDialog = false

      const key = this.activeMandat['.key']

      create(this.activeMandat, key)
        .then(() => (this.activeMandat = {}))
        .catch(err => console.error(err))

      this.$firebaseRefs.mandats
        .child(`${key}/statut`)
        .set('Liquider le mandat')
        .then(() => {
          this.$firebaseRefs.mandats.child(key).remove()
        })
        .then(() => {
          setTimeout(() => (this.animation = 'roll'), 2000)
        })
    },
    snackBarClipboard() {
      this.snackbar.message = 'Titre du mandat copié'
      this.snackbar.showSnack = false
    },
    saveRemarque(newRemarque, mandat) {
      const key = mandat['.key']
      this.$firebaseRefs.mandats
        .child(key)
        .child('remarque')
        .set(newRemarque)
    },
    dropConfetti(shape = 'rect', durée = 3000, colors) {
      this.$confetti.start({
        shape,
        colors,
      })
      setTimeout(() => {
        this.$confetti.stop()
      }, durée)
    },
  },
  created() {
    this.snackbar.showSnack = bus.snackbar.showSnack
    this.snackbar.message = bus.snackbar.message

    bus.snackbar.showSnack = false
    this.$bindAsArray(
      'mandats',
      db.ref('mandatsEnCours').orderByChild('timeStamp'),
      null,
      () => {
        this.isLoading = false
      }
    )
  },
  components: {
    Mandat: Mandat,
    mandatDetails: MandatDetails,
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.line {
  background-color: rgba(0, 0, 0, 0.12);
  border: none;
  height: 1px;
  width: 200px;
  text-align: center;
  margin: 0 auto;
}

.smartView {
  flex-wrap: wrap;
  justify-content: center;
}

.roll-enter-active {
  animation: rollIn 1s;
}

.roll-leave-active {
  animation: rollOut 1s;
  position: absolute; /*apply a absolute positioning to items that are leaving to remove them from the natural flow in order to trigger the move transition on the rest of the items */
}

.roll-move {
  transition: transform 1s;
}

.fold-leave-active {
  animation: fold 1s;
}

.fold-move {
  transition: transform 1s;
  transition-delay: 1s;
}

/* originally authored by Nick Pettit - https://github.com/nickpettit/glide */

@keyframes fold {
  0% {
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform: scale3d(1, 1, 1);
  }
  30% {
    animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
    transform: scale3d(1, 0.4, 1);
  }
  60% {
    animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
    transform: scale3d(0.4, 0.4, 1);
  }
  100% {
    opacity: 0;
    animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
    transform: scale3d(0.2, 0.2, 0.2);
  }
}

@keyframes rollIn {
  from {
    opacity: 0;
    transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes rollOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);
  }
}
</style>
