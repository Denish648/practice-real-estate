"use client"
import { LoginAPI } from "@/app/api/(auth)/login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function login() {
    const router = useRouter()
    const [data,setData] = useState({
        email:"",
        password:""
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
        const {userData,error} = await LoginAPI(data.email,data.password)

        if(error){
            console.log(error);
            return;
        }

        const role = userData?.user?.user_metadata?.role;

        if(role){
            router.push(`/dashboard/${role}`)
            router.refresh();
        }else{
            router.push("/")
            router.refresh();
        }
    }
  return (
   <>
   <div className="flex flex-col gap-10">
   <h1>login</h1>
   <form action="" className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)}>
   <div className="flex gap-5">
   <label htmlFor="">email</label>
   <input className="border" type="email" name="email" value={data.email} onChange={(e) => onChangeText(e)}/>
   </div>
   <div className="flex gap-5">
   <label htmlFor="">password</label>
   <input className="border" type="password" name="password" value={data.password} onChange={(e) => onChangeText(e)}/>
   </div>
   <br/>
   <button type="submit" className="border w-max px-10">submit</button>
   </form>

   <br/>

   <Link href="/forgot-password">forgot password?</Link>
   <br/><br/>
   <Link href="/signup">new account?</Link>
   </div>
   </>
  );
}
