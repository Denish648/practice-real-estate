import { createClient } from "@/lib/supabase/server";

export async function SignupAPI(email:string,password:string,name:string,company:string,role:string,phone:string){
    try{
        const supabase = await createClient()
        const {data,error} = await supabase.auth.signUp({
        email,
        password,
        options:{
            data:{
                name,
                company,
                role,
                phone
            }
        }
        });      
        return {userData:data,error};
    }catch(e){
        return {userData:null,error:e}
    }   
} 