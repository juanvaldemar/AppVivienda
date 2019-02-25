import { Component, OnInit,NgZone,Injectable } from '@angular/core';
import * as globals from '../globals/globals';
import { AuthService } from '../servicios/auth.service';
import { FirebaseService } from '../servicios/firebase.service';
import { Router } from '@angular/router';
import { MapsAPILoader } from '@agm/core';
import { NgForm } from '@angular/forms';
import {NgbDate, NgbCalendar,NgbDatepickerConfig,NgbDatepickerI18n,NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
declare var google;
declare var $ :any;

class RequestDepartment {
	id: string
	value: any
}

interface marker {
  id:number;
  nombre:string;
	lat: number;
  lng: number;
  color: string;
}

interface dis {
  id:number;
  nombre:string;
  provincia:string;
  departamento:string;
}

const WEEKDAYS_SHORT = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Injectable()
export class NgbDatepickerI18nPersian extends NgbDatepickerI18n {
  getWeekdayShortName(weekday: number) { return WEEKDAYS_SHORT[weekday - 1]; }
  getMonthShortName(month: number) { return MONTHS[month - 1]; }
  getMonthFullName(month: number) { return MONTHS[month - 1]; }
  getDayAriaLabel(date: NgbDateStruct): string { return `${date.year}-${this.getMonthFullName(date.month)}-${date.day}`; }
}



@Component({
  selector: 'app-register-solicitud',
  templateUrl: './register-solicitud.component.html',
  styleUrls: ['./register-solicitud.component.css'],
  providers: [
    {provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nPersian}
  ]
})
export class RegisterSolicitudComponent implements OnInit {

  public register:any = {};
  public isLogged: boolean = false;
  public user:string;

  public objDepart: any;
	public keyDeparts: string[];
  public selectDepart: any;
  public departSeleccionado  = 0;

  public objProvs: any;
	public showProvs = new Array();
	public keyProvs: string[];
	public selectProv: any;
  public proviSeleccionado = 0;

  public objDists: any;
	public showDists = new Array();
	public selectDistric: any;
	public keyDistrs: string[];
  public districSeleccionado = 0;

  public latitude: number;
  public longitude: number;
  public zoom:number;
  public markers: marker[]=[];
  public colors = ['red', 'blue', 'olive', 'orange', 'black',
        'gray', 'lightblue', 'purple', 'green','teal','maroon','tan','cornflowerblue','gold','goldenrod','mediumseagreen'];
  public distric: dis[]=[];


  public ub_dis:boolean = true;
  public ub_area:boolean = false;


  public rangeDate:boolean=false;
  public hoveredDate: NgbDate;
  public fromDate: NgbDate;
  public toDate: NgbDate;
  public de:Date;
  public hasta:Date;




  constructor(private authService: AuthService ,
    private FirebaseService: FirebaseService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private calendar: NgbCalendar,
    private config: NgbDatepickerConfig) {
    config.minDate = calendar.getToday();
    }

  ngOnInit() {
    this.getCurrentUser();
    this.resetear();
    this.obtenerDepartamentos();
    this.changeCheckbox();

    console.log(new Date());


  }






onlyNumber(event) {
     const pattern = /[0-9]/;
     let inputChar = String.fromCharCode(event.charCode);

     if (!pattern.test(inputChar)) {
         event.preventDefault();
     }
}

getCurrentUser() {
    this.authService.isAuth().subscribe(auth => {
      if (auth) {
        this.isLogged = true;
        console.log(this.isLogged);
        this.user=auth.uid;

      }else {
        this.isLogged = false;
        console.log(this.isLogged);
        this.user="";
      }
    });
}

resetear(){
    this.register.type_apar="DEPARTAMENTO"
    this.register.operation="DEPARTAMENTO"
    this.register.door="1"
    this.register.bano="1"
    this.register.cochera="NO"
    this.register.vista="INTERNA"
    this.register.tipo="FLAT"
    this.register.amoblado="FULL"
    this.register.man_type="SOLES"
    this.register.pre_type="SOLES"
    this.register.proyecto="SI"
    this.register.estreno="SI"
    this.register.terraza=false
    this.register.mascota=false
    this.register.deposito=false
    this.register.ascensor=false
    this.register.vigilancia=false
    this.register.servicio=false
    this.register.dscp=false
    this.register.reunion=false
    this.register.piscina=false
    this.register.gym=false
    this.register.parrilla=false
    this.register.juego=false
    this.register.departamento=""
    this.register.distrito=""
    this.register.provincia=""
    this.register.area=""
    this.register.pre_price=""
    this.register.man_price=""
    this.register.comentario=""
    this.latitude=-12.114090
    this.longitude=-77.027842
    this.zoom=14
    this.markers=[]
    this.distric=[]
    this.ub_dis= true
    this.ub_area= false
    this.rangeDate=false
    this.register.fromDate = ""
    this.register.toDate = ""
    $(".chb").removeClass("pintar");
}

sortByTwoProperty = () => {
		return (x, y) => {
			return ((x["value"]["name"] === y["value"]["name"]) ? 0 : ((x["value"]["name"] > y["value"]["name"]) ? 1 : -1));
		}
}

sortByProperty = (property) => {
		return (x, y) => {
			return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
		}
}

obtenerDepartamentos() {
    this.objDepart = globals.DEPARTMENTS_DIRECTION;
		let arrayDepartments: RequestDepartment[] = Array()
		this.keyDeparts = []
		for (let i in this.objDepart) {
			let obj = new RequestDepartment()
			obj.id = i
			obj.value = this.objDepart[i]
			arrayDepartments.push(obj)
		}
		arrayDepartments.sort(this.sortByTwoProperty())
		for (let i = 0; i < arrayDepartments.length; i++) {
			this.keyDeparts.push(arrayDepartments[i]["id"])
		}
}

selDepart() {
		this.selectDepart = document.getElementById("department");
    this.departSeleccionado = this.selectDepart.value;
    this.listarProvincias(this.departSeleccionado);

    this.selCity();


}

listarProvincias(skuDep) {
    this.objProvs = globals.PROVINCE_DIRECTION;
		this.showProvs.length = 0;
		this.keyProvs = Object.keys(this.objProvs);
		this.keyProvs.forEach((item, index) => {
			if (this.objProvs[item].skuDep == skuDep) {
				this.showProvs.push(this.objProvs[item]);
			}

		})
}

selCity() {

		this.selectProv = document.getElementById("city");
    this.proviSeleccionado = this.selectProv.value;
    this.listarDistritos(this.departSeleccionado + this.proviSeleccionado);



}

listarDistritos(skuDepPro) {

    this.objDists = globals.DISTRICT_DIRECTION;
		this.showDists.length = 0;
		this.keyDistrs = Object.keys(this.objDists);
		this.keyDistrs.forEach((item, index) => {

			if (this.objDists[item].skuDepPro == skuDepPro) {
				this.showDists.push(this.objDists[item]);

			}
			this.showDists.sort(this.sortByProperty("name"))
		})

}

selDistrict() {
		this.selectDistric = document.getElementById("district");
    this.districSeleccionado = this.selectDistric.value;
}


  addDistrito(){
    if(this.register.distrito=="" || this.register.distrito.empty){

      alert("Debe seleccionar un distrito");

    }else{
      let departamento =globals.DEPARTMENTS_DIRECTION[this.register.departamento].name;
      let pronvincia =globals.PROVINCE_DIRECTION[this.register.departamento+this.register.provincia].name;
      let distrito = globals.DISTRICT_DIRECTION[this.register.departamento+this.register.provincia+this.register.distrito].name;

      if(this.distric.length<3){

        this.distric.push({
          id:this.distric.length,
          nombre:distrito,
          provincia:pronvincia,
          departamento:departamento
      });


      }else{

        alert("Solo puede seleccionar 3 distritos");

      }

    }
  }

  eliminarItem(texto){

    for (let index = 0; index < this.distric.length; index++) {

      if (this.distric[index].nombre == texto) {
        this.distric.splice(index, 1);
        break
      }
    }

    console.log(this.distric);

   }

   eliminarItem_mapa(lat,lng){

    for (let index = 0; index < this.markers.length; index++) {

      if (this.markers[index].lat == lat && this.markers[index].lng == lng ) {
        this.markers.splice(index, 1);
        break
      }
    }

    console.log(this.markers);

   }

  mapClicked(event){

    var lat = event.coords.lat;
    var lng = event.coords.lng;

    if(this.markers.length<3){
      let count = this.markers.length+1;
      this.markers.push({
        id: this.markers.length,
        nombre: "Area "+ count,
        lat: lat,
        lng: lng,
        color:this.colors[Math.floor(Math.random() * this.colors.length)]
      });

      console.log(this.markers);

    }else{
      alert("Solo puede seleccionar 3 lugares.");
    }

  }




change(valor){

  if(valor == 'distrito'){

    this.ub_dis= true;
    this.ub_area= false;

    console.log(this.ub_dis,this.ub_area);


  }else{

    this.ub_dis= false;
    this.ub_area= true;

    console.log(this.ub_dis,this.ub_area);
  }

}



onDateSelection(date: NgbDate) {
  if (!this.fromDate && !this.toDate) {
    this.fromDate = date;
  } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
    this.toDate = date;
    this.de =new Date(this.fromDate.year,this.fromDate.month-1,this.fromDate.day);
    this.hasta =new Date(this.toDate.year,this.toDate.month-1,this.toDate.day);
    console.log(this.de,this.hasta);
  } else {
    this.toDate = null;
    this.fromDate = date;
  }
}

isHovered(date: NgbDate) {
  return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
}

isInside(date: NgbDate) {
  return date.after(this.fromDate) && date.before(this.toDate);
}

isRange(date: NgbDate) {
  return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
}

changeVacacional(valor){

  this.register.operation=valor;

  if(valor == "VACACIONAL"){

    this.rangeDate=true;
    this.fromDate = this.calendar.getToday();
    this.toDate = null;

  }else{

    this.rangeDate=false;
    this.fromDate = null;
    this.toDate = null;

  }

}


registersolicitud(form: NgForm){

  if (this.isLogged) {


    this.register.fecha=new Date();
    this.register.user=this.user;


      if(this.register.operation =="VACACIONAL"){

        if(this.fromDate==null ||  this.toDate == null){

          alert("Seleccionar rango de fechas");
          return false;

        }else{

          this.register.fromDate = this.de;
          this.register.toDate = this.hasta;

        }
      }else{

         this.register.fromDate = ""
         this.register.toDate = ""
      }



      if(this.ub_dis){

        if(this.distric.length>0){

          this.register.distrito= this.distric;

        }else{

          alert("Debe seleccionar un distrito.");

          return false;

        }

      }else{

        this.register.distrito=[]

      }

      if(this.ub_area){

        if(this.markers.length>0){

          this.register.radius=this.markers;


        }else{

           alert("Debe seleccionar una area.");
           return false;
        }

      }else{

        this.register.radius=[];

      }


      console.log(JSON.stringify(this.register));

      this.FirebaseService.register_solicitud(this.register).then((res) =>{

        form.reset();
        this.resetear();
          $("#modal_ok").modal('show');

     }).catch((err)=>

       alert("error")

     );





  }else {

    $("#exampleModalCenter").modal('show');

  }

}


cerrar():void{

  $("#modal_ok").hide();
  $(".modal-backdrop").hide();

  this.router.navigate(['perfil']);
}


changeCheckbox(){


    //Ten en cuenta que estamos seleccionando por clase label-cliente. Como estamos jugando con los children (en este caso los input) no deberías tener problemas si tienes varios label/input pero tenlo en cuenta.
    $(".chb").click(function(){
      //Si el hijo está checked le ponemos a la label el color #2d89ef si no el #5e5e5e
      if($(this).children().is(":checked"))
      {
        $(this).addClass("pintar");
      }
      else
      {
        $(this).removeClass("pintar");
      }
    });

  }





}