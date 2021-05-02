import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public http:HttpClient,private spinner: NgxSpinnerService){}
  title = 'FrontEnd';
  page:number = 1; //1->login 2->OTP 3->Signup,4-> Verified
  phone:any = null;
  otp:number = null;
  flashMsg = null;
  newPhone:any = null;

  toggleOTP(input:number){
    this.flashMsg = null;
    this.page = input;
  }

  Login(form:NgForm){
    this.spinner.show();
      this.http.post(`${environment.domain}/requestOTP`,{'phone':this.phone}).subscribe((res)=>{
        if(res['success'] == true){
          this.spinner.hide()
          localStorage.setItem('hashToken',res['response']);
          this.flashMsg = "OTP is sent to your mobile";
          this.page = 2;
          form.resetForm()
        }else{
          this.spinner.hide()
          this.flashMsg = res['message'];
          this.page = 1;
        }
      },err=>{
        this.spinner.hide()
        this.flashMsg = err.statusText
      })
    setTimeout(() => {
        this.flashMsg = null;
    }, 50000);
  }


  VerifyAccount(form:NgForm){
    let body = {
      'otp':this.otp,
      'token':localStorage.getItem('hashToken')
    }
    this.spinner.show();
    this.http.post(`${environment.domain}/verifyUser`,body).subscribe(res=>{
      if(res['success'] == true){
          this.spinner.hide()
          localStorage.setItem('access',res['response'])
          this.flashMsg = res['message'];
          this.page = 4;
          form.resetForm()
      }else{
          this.spinner.hide()
          this.flashMsg = res['message'];
          this.page = 2;
      }
    },err=>{
      this.spinner.hide()
      this.flashMsg = err.statusText == "OK" ? "Invalid OTP" : "Bad request"
    })
    setTimeout(() => {
      this.flashMsg = null;
    }, 50000);
  }

  Signup(form:NgForm){
    this.spinner.show();
    this.http.post(`${environment.domain}/signup`,{'phone':this.newPhone}).subscribe((res)=>{
      if(res['success'] == true){
        this.spinner.hide()
        localStorage.setItem('hashToken',res['response']);
        this.flashMsg = res['message'];
        this.page = 2;
        form.resetForm()
      }else{
        this.spinner.hide()
        this.flashMsg = res['message'];
        this.page = 1;
      }
    },err=>{
      this.spinner.hide()
      this.flashMsg = err.statusText == "OK" ? err.message : "Intenal error."
    })
    setTimeout(() => {
        this.flashMsg = null;
    }, 50000);
  }
}
