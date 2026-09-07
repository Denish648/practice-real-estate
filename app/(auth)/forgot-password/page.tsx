"use client";
import { ForgotPassowordAPI } from "@/app/api/(auth)/forgot-password";
import { useState } from "react";

export default function forgotpassword(){
   const [email,setEmail] = useState("")

   function onChangeText(e:any){
        const value = e.target.value;
        setEmail(value)
   }
   async function handleSubmit(e:any){
        e.preventDefault();
        await ForgotPassowordAPI(email)
   }
   
    return <>
       <div className="flex flex-col gap-10">
        <h1>forgot password</h1>

    <form action="" className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)}>
        <div className="flex gap-5">
            <label htmlFor="">email</label>
            <input className="border" type="email" name="email" value={email} onChange={(e) => onChangeText(e)}/>
        </div>
        <button type="submit" className="border w-max px-5">submit</button>
    </form>
        </div>
    </>
}