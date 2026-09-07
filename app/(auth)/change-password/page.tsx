"use client";
import { ChangePassowordAPI } from "@/app/api/(auth)/change-password";
import { useState } from "react";

export default function changeassword(){
   const [password,setPassword] = useState("")

   function onChangeText(e:any){
        const value = e.target.value;
        setPassword(value)
   }
   async function handleSubmit(e:any){
        e.preventDefault();
        await ChangePassowordAPI(password)
   }
   
    return <>
       <div className="flex flex-col gap-10">
        <h1>change password</h1>

    <form action="" className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)}>
        <div className="flex gap-5">
            <label htmlFor="">email</label>
            <input className="border" type="password" name="password" value={password} onChange={(e) => onChangeText(e)}/>
        </div>
        <button type="submit" className="border w-max px-5">submit</button>
    </form>
        </div>
    </>
}