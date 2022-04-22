const app = Vue.createApp({
  data() {
      return {
         congressMembers:[],
         order_congressMembers:[],
         stateFilter:[],
         partys:["D","R","ID"],
         state:"",
         congressStats:{//vector de datos
           democrats:[],
           republicans:[],
           independents:[],
           democrats_average_votes:0,
           republicans_average_votes:0,
           independents_average_votes:0,
           leastEngaged:[],
           mostEngaged:[],
           leastLoyalty:[],
           mostLoyalty:[]            
         }
      }
  },
  created() {//Zona que solicita recursos para consumo y clave        
      //let chamber = document.title.includes('Senate') ? "senate" : "house"
      // chamber = house ? "house" : "senate";
      let docUrl =  window.location.pathname.split("/").pop();
      let chamber = "";
      //seleccionar pagina que presentara utilizando piping 
      if(docUrl === "house.html" || docUrl === "houseAttendance.html" || docUrl === "houseParty.html")
       { chamber = "house"; }
      else if (docUrl === "senate.html" || docUrl === "senateAttendance.html" || docUrl === "senateParty.html")//aplicar piping si se agregan mas documentos html
       { chamber = "senate"; }

      let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`

      let init = {
          headers: {
             'X-API-Key': '2NtI0VybQDReIdrcwEqVafwqRsxG8mZ5aE4tW2BI'
          }
      }
      fetch(endpoint,init) //Generar promesa
        .then(res=>res.json())
        .then(json=> {
            this.congressMembers = json.results[0].members//se recibe cabeza de json

            this.initStateOptions()  //filtrar y ordenar por estados para seleccion
            //separa por partidos
            this.loadPartyMembers('democrats','D')
            this.loadPartyMembers('republicans','R')
            this.loadPartyMembers('independents','ID')
            //Metodos de estimacion de promedios obtenidos por representantes
            this.estimateAverageVotes('democrats','democrats_average_votes')
            this.estimateAverageVotes('republicans','republicans_average_votes')
            this.estimateAverageVotes('independents','independents_average_votes')
            /* +- comprometidos */
            this.estimateStatsMembers("missed_votes_pct",'mostEngaged','leastEngaged')
            /* +/- lealtad */
            this.estimateStatsMembers("votes_against_part_pct",'mostLoyalty','leastLoyalty')

        })
        //console.log(congressMembers)
  },
  methods:
{   initStateOptions()
      {  this.congressMembers.forEach(member => {
          if (!this.stateFilter.includes(member.state))
          {
               this.stateFilter.push(member.state)
          }
        })//ordenar salida
         this.stateFilter.sort()
      },
/**********************************************************/
  loadPartyMembers(party,atrib)
      {
          this.congressStats[party]=this.congressMembers.filter(member => member.party===atrib)
      },
/**********************************************************/
  estimateAverageVotes(party,promVotes)
      {  this.congressStats[party].forEach(member=>{
              this.congressStats[promVotes]= (this.congressStats[promVotes]+
                                          member.votes_with_party_pct)/
                                          this.congressStats[party].length
           })
      },
/**********************************************************/
      estimateStatsMembers(votes,most,least)//least/most-> attendance/loyal
      {  let order_congressMembers = [...this.congressMembers].filter(member =>member.total_votes > 0  && member.id!="E000172")
         order_congressMembers.sort((memberini, memberfin) => {
             if(memberini[votes] > memberfin[votes]) { return 1; }
             if(memberini[votes] < memberfin[votes]) { return -1;}
             return 0;
          })
         for(let i=0; i < (Math.round(this.congressMembers.length*0.1));i++)
         {  this.congressStats[most].push(order_congressMembers[i])   }

         for(let j= order_congressMembers.length-1; j >order_congressMembers.length -1 - (Math.round(this.congressMembers.length*0.1));j--)
            {  this.congressStats[least].push(order_congressMembers[j]) }  
      }
  
},//end methods
     
computed:
{
   //Funcion de seleccion
    selectPartyMembers()
     {   let selMembers= []
          selMembers=this.congressMembers.filter(member => this.partys.includes(member.party) && (member.state===this.state || this.state === ""))
      return selMembers;  
     },

     //Function para pintar tabla en DOM-> Document Object Model-> SGML->HTML->XML->Front-End->View
      paintPartyTable()
      {  let partyTable = [
           {   party: 'Democrats',
               num_reps:this.congressStats.democrats.length,
               votes_with_party:this.congressStats.democrats_average_votes.toFixed(2)
           },

           {   party: 'Republicans',
               num_reps:this.congressStats.republicans.length,
               votes_with_party:this.congressStats.republicans_average_votes.toFixed(2)
           },

           {   party: 'Independents',
               num_reps:this.congressStats.independents.length,
               votes_with_party:this.congressStats.independents_average_votes.toFixed(2)
           },
           {   party: 'Total',
               num_reps:this.congressMembers.length,
               votes_with_party:((this.congressStats.independents_average_votes+
                               this.congressStats.democrats_average_votes+
                               this.congressStats.republicans_average_votes) / 3).toFixed(2)

           }
          ]
          return partyTable
      }

  }//end computed process
})

app.mount("#app");
//const mountApp = app.mount("#app");