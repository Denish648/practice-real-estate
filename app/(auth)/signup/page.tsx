"use client"
import { useState } from "react";
import {SignupAPI} from "../../api/(auth)/signup/index"
import Link from "next/link";

export default function signup() {
    const [data,setData] = useState({
        email:"",
        password:"",
        name:"",
        company:"",
        phone:"",
        role:""
    })
    const onChangeText = (e:any) => {
        const name = e.target.name;
        const value = e.target.value;
        setData(prev => ({
            ...prev,
            [name]:value
        }))
    }

    const handleSubmit = async(e:any) =>{
        e.preventDefault();
        await SignupAPI(data.email,data.password,data.name,data.company,data.role,data.phone)
    }
  return (
   <>
   <div className="flex flex-col gap-10">
   <h1>Signup</h1>
   <form action="" className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)}>
    {/* name */}
    <div className="flex gap-5">
   <label htmlFor="">name</label>
   <input className="border" type="text" name="name" value={data.name} onChange={(e) => onChangeText(e)}/>
   </div>
   {/* company */}
   <div className="flex gap-5">
   <label htmlFor="">company</label>
   <input className="border" type="text" name="company" value={data.company} onChange={(e) => onChangeText(e)}/>
   </div>
   {/* role */}
   <div className="flex gap-5">
   <label htmlFor="">role</label>
   <div className="flex gap-5">
    <label htmlFor="">broker
    <input className="border" type="radio" value="broker" name="role" checked={data.role === "broker"} onChange={(e) => onChangeText(e)}/>
    </label>
    <label htmlFor="">buyer
    <input className="border" type="radio" value="buyer" name="role" checked={data.role === "buyer"} onChange={(e) => onChangeText(e)}/>
    </label>
   </div>
   </div>
   {/* phone */}
    <div className="flex gap-5">
   <label htmlFor="">phone</label>
   <input className="border" type="text" name="phone" value={data.phone} onChange={(e) => onChangeText(e)}/>
   </div>
   {/* email */}
   <div className="flex gap-5">
   <label htmlFor="">email</label>
   <input className="border" type="email" name="email" value={data.email} onChange={(e) => onChangeText(e)}/>
   </div>
   {/* password */}
   <div className="flex gap-5">
   <label htmlFor="">password</label>
   <input className="border" type="password" name="password" value={data.password} onChange={(e) => onChangeText(e)}/>
   </div>
   <button type="submit" className="border w-max px-10">submit</button>
   </form>
   <Link href="/login">login here</Link>
   </div>
   </>
  );
}
