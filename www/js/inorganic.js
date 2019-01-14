String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.removeParens = function() {
    var target=this;
   for(var i=0;i<target.length;i++){
       if(target.substring(i,i+1)==="("||target.substring(i,i+1)===")"){
           target=target.substring(0,i)+target.substring(i+1);
       }
   }
   return target;
};


var inorganic={
    setup:function(){},
    compound:{},
    genQuestion:function(){
        var comp=this.getRandCompound();
        this.compound=comp;
        var r=Math.floor(Math.random()*(1-0+1)+0);//rand for qhich type of question
        //r=1 is give formula want name
        //r!=1 is give name want formula
        var q="<div class='remove'data-type="+r+">What is the";//questins
        var n=comp.Name;//name of compound
       
        if(r==1){
            q+=" name of "+comp.Formula+" ?";
        }else{
            q+=" formula of "+n+" ?";
        }
        q+="</div>";
        $(".remove").replaceWith("");
        $("#question").append(q);
    },
    getRandCompound:function(){
        var r=Math.floor(Math.random()*(1-0+1)+0);
        if(r==1){
           return this.getRandIonic(); 
        }else{
            return this.getRandCompound();
        }
    },
    getRandIonic:function(){
        var cat=this.getRandCation();
        var an=this.getRandAnion();
        console.log(cat,an);
        var name=cat.name+" "+an.name;
        var nameArr=[];
        if(name.indexOf("%")>-1){
             var catNameArr=this.getNames(cat);
             var anNameArr=this.getNames(an);
             for(var i=0;i<catNameArr.length;i++){
                 for(var j=0;j<anNameArr.length;j++){
                     console.log(an)
                     this.suffixitArr(an,j);
                     nameArr.push(catNameArr[i]+anNameArr[j]);
                 }
             }
             name=nameArr[0];
        }
        var catNumb=Math.abs(parseInt(an.charge));
        var anNumb=Math.abs(parseInt(cat.charge));
        var reduced=this.commonFactor(catNumb,anNumb);
        catNumb=reduced[0];
        anNumb=reduced[1];
        if(an.isPoly){
            an.elemSymb=this.polySubscripter(an.elemSymb,anNumb)
        }
        if(cat.isPoly){
           cat.elemSymb= this.polySubscripter(cat.elemSymb,catNumb)
        }
        if(catNumb==1){
            catNumb="";
        }
        if(anNumb==1){
            anNumb="";
        }
        var formula="<div>"+cat.elemSymb+"<sub>"+catNumb+"</sub>"+an.elemSymb+"<sub>"+anNumb+"</sub></div>";
        console.log(name,formula,nameArr);
        return {Name:name,Formula:formula,NameArray:nameArr};
    },
    getRandAnion:function(){
       var list= ions.anion;
       var anKeys=Object.keys(list);
       //Math.floor(Math.random()*(max-min+1)+min);
       var r=Math.floor(Math.random()*(anKeys.length));
       // console.log(r)
       return list[anKeys[r]];
    },
    getRandCation:function(){
       var list= ions.cation;
       var catKeys=Object.keys(list);
       var r=Math.floor(Math.random()*(catKeys.length));
      // console.log(r)
       return list[catKeys[r]];

    },
    checkAns:function(){
        var ans=$("#answer")[0].value;
        console.log(ans);
        var type=$("#question")[0].children[0].dataset.type;
        var formAns=this.scrubName(this.compound.Formula);
        if(type==1){
             console.log(this.compound.NameArray);
            if(this.compound.NameArray.length>0){
                var isCorrect=false;
                this.compound.NameArray.forEach(function(element) {
                    element.removeParens();
                }, this);
                ans.removeParens();
                var fuzzyMatch=FuzzySet(this.compound.NameArray);
                console.log(this.compound.NameArray,ans)
                var matchRes=fuzzyMatch.get(ans,[]);
                if(matchRes===null||matchRes==null||matchRes.length<1){
                    matchRes=[];
                    console.log("not found")
                }
                console.log(matchRes)
                for(var i=0;i<matchRes.length;i++){
                    if(matchRes[i][0]>0.9){
                        isCorrect=true;
                    }
                }
            }else{
                var fuzzyMatch=FuzzySet([this.compound.Name.toLowerCase().removeParens()]);
                console.log(fuzzyMatch.get(ans.removeParens().toLowerCase()));
                if(fuzzyMatch.get(ans.removeParens().toLowerCase())[0][0]>0.87){
                    isCorrect=true;
                }
            }
            if(isCorrect){
                this.correctAnsResp();
            }else{
                this.generateHint();
            }
        }else{
            console.log(ans,formAns);
            if(ans.replace(" ","").indexOf(formAns.replace(" ",""))>-1){
                this.correctAnsResp();
            }else{
                this.generateHint();
            }
        }
    },
    correctAnsResp:function(){
        console.log("correct");
    },
    generateHint:function(){
        console.log("incorrect");
    },
    cleanUp:function(){
        $("#answer")[0].value="";
    },
    getNames:function(compound){
        return compound.name.split("%");
    },
    suffixitArr:function(anion,i){
        console.log(anion,anion.isPoly);
        if(anion.isPoly&&anion.NameArray!=undefined){
            anion.NameArray[i]=anion.NameArray[i].substring(0,name.length-3)+"ide";
        }else if(anion.isPoly){
            anion.name=anion.name.substring(0,name.length-3)+"ide";
        }
    },
    scrubName:function(string){
        return string.replaceAll("<sub>","").replaceAll("</sub>","").replaceAll("</div>","").replaceAll("<div>","");
    },
    commonFactor:function(n1,n2){
        if(n1!=1&&n2!=1){
        if(n1%n2==0){
            n1=n1/n2;
            n2=1;
        }
        if(n1%n2==0){
            n2=n2/n1;
            n1=1;
        }}
        return [n1,n2];
    },
    polySubscripter:function(string,n){
        if(n!=1){
            return "("+string+")";
        }else{
            return string;
        }
    },

}
var ions={
    anion:{
        acetate:{name:"Acetate",charge:"-1",elemSymb:"C2H3O2",isPoly:true},
        bromate:{name:"Bromate",charge:"-1",elemSymb:"BrO3",isPoly:true},
        bromide:{name:"Bromide",charge:"-1",elemSymb:"Br",isPoly:false},
        chlorate:{name:"Chlorate",charge:"-1",elemSymb:"ClO3",isPoly:true},
        chloride:{name:"Chloride",charge:"-1",elemSymb:"Cl",isPoly:false},
        cyanide:{name:"Cyanide",charge:"-1",elemSymb:"CN",isPoly:true},
        fluoride:{name:"Fluoride",charge:"-1",elemSymb:"F",isPoly:false},
        hydride:{name:"Hydride",charge:"-1",elemSymb:"H",isPoly:false},
        bicarbonate:{name:"Hydrogen carbonate%Bicarbonate",charge:"-1",elemSymb:"HCO3",isPoly:true},
        bisulfate:{name:"Hydrogen sulfate%Bisulfate",charge:"-1",elemSymb:"HSO4",isPoly:true},
        bisulfite:{name:"Hydrogen sulfite%Bisulfite",charge:"-1",elemSymb:"HSO3",isPoly:true},
        hydroxide:{name:"Hydroxide",charge:"-1",elemSymb:"OH",isPoly:true},
        hypochlorite:{name:"Hypochlorite",charge:"-1",elemSymb:"ClO",isPoly:true},
        iodate:{name:"Iodate",charge:"-1",elemSymb:"IO3",isPoly:true},
        iodide:{name:"Iodide",charge:"-1",elemSymb:"I",isPoly:false},
        nitrate:{name:"Nitrate",charge:"-1",elemSymb:"NO3",isPoly:true},
        nitrite:{name:"Nitrite",charge:"-1",elemSymb:"NO2",isPoly:true},
        perchlorate:{name:"Perchlorate",charge:"-1",elemSymb:"ClO4",isPoly:true},
        permanganate:{name:"Permanganate",charge:"-1",elemSymb:"MnO4",isPoly:true},
        thiocyanate:{name:"Thiocyanate",charge:"-1",elemSymb:"SCN",isPoly:true},
        carbonate:{name:"Carbonate",charge:"-2",elemSymb:"CO3",isPoly:true},
        chromate:{name:"Chromate",charge:"-2",elemSymb:"CrO4",isPoly:true},
        dichromate:{name:"Dichromate",charge:"-2",elemSymb:"Cr2O7",isPoly:true},
        oxalate:{name:"Oxalate",charge:"-2",elemSymb:"C2O4",isPoly:true},
        oxide:{name:"Oxide",charge:"-2",elemSymb:"O",isPoly:false},
        peroxide:{name:"Peroxide",charge:"-2",elemSymb:"O2",isPoly:true},
        silicate:{name:"Silicate",charge:"-2",elemSymb:"SiO3",isPoly:true},
        sulfate:{name:"Sulfate",charge:"-2",elemSymb:"SO4",isPoly:true},
        sulfide:{name:"Sulfide",charge:"-2",elemSymb:"S",isPoly:false},
        sulfite:{name:"Sulfite",charge:"-2",elemSymb:"SO3",isPoly:true},
        arsenate:{name:"Arsenate",charge:"-3",elemSymb:"AsO4",isPoly:true},
        borate:{name:"Borate",charge:"-3",elemSymb:"BO3",isPoly:true},
        phosphate:{name:"Phosphate",charge:"-3",elemSymb:"PO4",isPoly:true},
        phosphide:{name:"Phosphide",charge:"-3",elemSymb:"P",isPoly:false},
        phosphite:{name:"Phosphite",charge:"-3",elemSymb:"PO3",isPoly:true},
        dihydrogen_phosphate:{name:"Dihydrogen phosphate",charge:"-1",elemSymb:"H2PO4",isPoly:true},
        bisulfide:{name:"Hydrogen sulfide%bisulfide",charge:"-1",elemSymb:"HS",isPoly:true},
        hydrogen_phosphate:{name:"Hydrogen phosphate",charge:"-2",elemSymb:"HPO4",isPoly:true},
        benzoate:{name:"Benzoate",charge:"-1",elemSymb:"C6H5COO",isPoly:true},
        thiosulfate:{name:"Thiosulfate",charge:"-2",elemSymb:"S2O3",isPoly:true},
        fluoride:{name:"Fluoride",charge:"-1",elemSymb:"F",isPoly:false},
        chloride:{name:"Chloride",charge:"-1",elemSymb:"Cl",isPoly:false},
        bromide:{name:"Bromide",charge:"-1",elemSymb:"Br",isPoly:false},
        iodide:{name:"Iodide",charge:"-1",elemSymb:"I",isPoly:false},
    },
    cation:{
        ammonium:{name:"Ammonium",charge:"1",elemSymb:"NH4",isPoly:true},
        cuprous:{name:"Copper (I)%Cuprous",charge:"1",elemSymb:"Cu",isPoly:false},
        hydrogen:{name:"Hydrogen",charge:"1",elemSymb:"H",isPoly:false},
        potassium:{name:"Potassium",charge:"1",elemSymb:"K",isPoly:false},
        silver:{name:"Silver",charge:"1",elemSymb:"Ag",isPoly:false},
        sodium:{name:"Sodium",charge:"1",elemSymb:"Na",isPoly:false},
        barium:{name:"Barium",charge:"2",elemSymb:"Ba",isPoly:false},
        cadmium:{name:"Cadmium",charge:"2",elemSymb:"Cd",isPoly:false},
        calcium:{name:"Calcium",charge:"2",elemSymb:"Ca",isPoly:false},
        cobalt_ii:{name:"Cobalt (II)",charge:"2",elemSymb:"Co",isPoly:false},
        cupric:{name:"Copper (II)%Cupric",charge:"2",elemSymb:"Cu",isPoly:false},
        ferrous:{name:"Iron (II)%Ferrous",charge:"2",elemSymb:"Fe",isPoly:false},
        lead_ii:{name:"Lead (II)",charge:"2",elemSymb:"Pb",isPoly:false},
        magnesium:{name:"Magnesium",charge:"2",elemSymb:"Mg",isPoly:false},
        manganese_ii:{name:"Manganese (II)",charge:"2",elemSymb:"Mn",isPoly:false},
        mercuric:{name:"Mercury (II)%Mercuric",charge:"2",elemSymb:"Hg",isPoly:false},
        nickel_ii:{name:"Nickel (II)",charge:"2",elemSymb:"Ni",isPoly:false},
        stannous:{name:"Tin (II)%Stannous",charge:"2",elemSymb:"Sn",isPoly:false},
        zinc:{name:"Zinc",charge:"2",elemSymb:"Zn",isPoly:false},
        aluminum:{name:"Aluminum",charge:"3",elemSymb:"Al",isPoly:false},
        antimony_iii:{name:"Antimony (III)",charge:"3",elemSymb:"Sb",isPoly:false},
        arsenic:{name:"Arsenic",charge:"3",elemSymb:"As",isPoly:false},
        bismuth_iii:{name:"Bismuth (III)",charge:"3",elemSymb:"Bi",isPoly:false},
        chromium_iii:{name:"Chromium (III)",charge:"3",elemSymb:"Cr",isPoly:false},
        ferric:{name:"Iron (III)%Ferric",charge:"3",elemSymb:"Fe",isPoly:false},
        titanous:{name:"Titanium (III)%Titanous",charge:"3",elemSymb:"Ti",isPoly:false},
        manganese_iv:{name:"Manganese (IV)",charge:"4",elemSymb:"Mn",isPoly:false},
        stannic:{name:"Tin (IV)%Stannic",charge:"4",elemSymb:"Sn",isPoly:false},
        titanic:{name:"Titanium (IV)%Titanic",charge:"4",elemSymb:"Ti",isPoly:false},
        antimony_v:{name:"Antimony (V)",charge:"5",elemSymb:"Sb",isPoly:false},
        arsenic_v:{name:"Arsenic (V)",charge:"5",elemSymb:"As",isPoly:false},
        cesium:{name:"Cesium",charge:"1",elemSymb:"Cs",isPoly:false},
        strontium:{name:"Strontium",charge:"2",elemSymb:"Sr",isPoly:false},
        gallium:{name:"Gallium",charge:"3",elemSymb:"Ga",isPoly:false},
        nickel_iii:{name:"Nickel (III)",charge:"3",elemSymb:"Ni",isPoly:false},
        carbon:{name:"Carbon",charge:"4",elemSymb:"C",isPoly:false},
        silicon:{name:"Silicon",charge:"4",elemSymb:"Si",isPoly:false},
        germanium:{name:"Germanium",charge:"4",elemSymb:"Ge",isPoly:false},

    },
   // 
}