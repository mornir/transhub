<template>
    <v-flex v-bind="{ [`xs${mandat.chargeTravail}`]: true }">
           <v-snackbar top v-model="snackbar"><span class="title">Titre du mandat copié <v-icon color="info">check_circle</v-icon></span></v-snackbar>
        <v-card  :color="currentStatutColor" :id="mandat.questions ? 'borderQuestion' : ''" :class="{faded : isFaded}">
            <v-card-actions>
                <span v-clipboard:copy="copyRefArchives" class="code-active" v-clipboard:success="onCopy">
                    <strong>{{mandat.code}}</strong>
                </span>
                <v-spacer></v-spacer>
                <v-menu offset-y>
                    <v-btn flat round small :ripple="false" slot="activator">{{isFaded ? 'En révision' : mandat.statut}}</v-btn>
                    <v-list>
                        <v-list-tile v-for="statut in statuts_trad" :key="statut.title" @click="setStatut(statut.title)">
                            <v-list-tile-title>{{ statut.title }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
                <v-spacer></v-spacer>
          <span>
                <v-btn icon :color="mandat.questions ? 'error' : ''" @click="toggleQuestions">
                        <v-icon>question_answer</v-icon>
                    </v-btn>

                           <v-dialog v-model="dialogRemarque" persistent>
                        <v-btn icon slot="activator" :color="mandat.remarque ? 'info' : ''" >
                           <v-icon>chat</v-icon>
                        </v-btn>
                        <v-card class="stepCard">
                            <v-toolbar flat>
                                <v-toolbar-title>Laisser un message</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <div v-if="!editRemarque">{{mandat.remarque}}</div>
                                <div v-else>
                                  <v-text-field name="remarque" v-model.trim="textRemarque" label="Remarque" multi-line>

                                   </v-text-field>
                                </div>
                         </v-card-text>
                      
                   <v-card-actions>
                                <v-btn @click="closeRemarque">Fermer</v-btn>
                                <v-btn v-if="editRemarque" @click="setRemarque" color="primary">enregistrer</v-btn>
                                <v-btn v-else  @click="editRemarque = true" color="primary">éditer</v-btn>
                   </v-card-actions>
                        </v-card>
                    </v-dialog>

          </span>
            </v-card-actions>
            <v-card-text>
            <div class="text-xs-center pb-2">
              <router-link :to="'edit/' + mandat['.key']" tag="span" class="code-active title">
               {{mandat.nom}}
                </router-link>
              </div>
                <div class="line"></div>
                <div class="subheading text-xs-center pt-2">
                    <div>
                      
                        À renvoyer à <strong>{{mandat.mandant.text.split(' ')[0]}}</strong>  d'ici au 
                          <v-icon color="error" v-if="mandat.heure !== '00:00' || mandat.priorité === 'Prioritaire'">warning</v-icon>
                        <strong>{{mandat.délai | formatDate}}</strong>
                        <strong v-if="mandat.heure !== '00:00'">{{mandat.heure}}</strong>
                    </div>
           
                    <div   v-if="mandat.statut === 'À réviser' && mandat.réviseur === me">
                 Traduit par
                        <strong>{{mandat.traducteur}}</strong>
                        <span v-if="mandat.TAO === 'Non'"><span class="sansTrados">sans</span> Trados</span>  
                    </div>
                    <div v-else>
                         
                        <span v-if="mandat.réviseur !== 'Sans révision'">Révision par</span>
                        <strong>{{mandat.réviseur}}</strong>   
                    </div>
                </div>
            </v-card-text>

        </v-card>
           
    </v-flex>
</template>

<script>
import { auth } from '../firebase'
import bus from '@/js/bus'
export default {
  props: {
    mandat: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      me: auth.currentUser.displayName,
      snackbar: false,
      dialogRemarque: false,
      editRemarque: false,
      textRemarque: this.mandat.remarque,
      copyRefArchives: `${this.mandat.code} ${this.mandat.nom.replace(
        /[\%\~\#\&\*\{\}\\\:\<\>\?\/\+\|\"]+/g,
        ''
      )}`,
      statuts_trad: [
        {
          title: 'À traduire',
        },
        {
          title: 'Premier jet fini',
        },
        {
          title: 'À réviser',
        },
        {
          title: 'Révision finie',
        },
        {
          title: 'Liquider le mandat',
        },
      ],
    }
  },
  computed: {
    currentStatutColor() {
      if (this.mandat.statut === 'Premier jet fini') {
        return bus.darkTheme ? 'blue lighten-4' : 'cyan darken-1'
      } else if (this.mandat.statut === 'À réviser') {
        return bus.darkTheme ? 'purple lighten-2' : 'purple darken-2'
      } else if (this.mandat.statut === 'Révision finie') {
        return bus.darkTheme ? 'light-blue lighten-2' : 'indigo darken-3'
      } else if (this.mandat.statut === 'Liquider le mandat') {
        return bus.darkTheme ? 'green lighten-2' : 'green darken-2'
      } else {
        return ''
      }
    },
    isFaded() {
      return (
        this.mandat.statut === 'À réviser' && this.mandat.traducteur === this.me
      )
    },
  },
  methods: {
    setRemarque() {
      this.editRemarque = false
      this.dialogRemarque = false
      this.$emit('newRemarque', this.textRemarque)
    },
    closeRemarque() {
      this.editRemarque = false
      this.dialogRemarque = false
      this.textRemarque = this.mandat.remarque
    },
    toggleQuestions() {
      this.$emit('questions', !this.mandat.questions)
    },
    setStatut(newStatut) {
      this.$emit('setStatut', newStatut)
    },
    onCopy() {
      this.snackbar = true
    },
  },
}
</script>

<style>
#borderQuestion {
  border: 5px solid #ff5252 !important;
}

.code-active:hover {
  cursor: pointer;
  text-decoration: underline;
}

.faded {
  opacity: 0.5;
}

.sansTrados {
  text-decoration: underline;
  text-decoration-color: red;
}
</style>
