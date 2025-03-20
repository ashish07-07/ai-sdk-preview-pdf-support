import prisma from "@/app/db";
export async function GET(req:Request,res:Response)
{   

    try 
    {
        const filedetails= await prisma.document.findMany(
            {
                select:
                {
                    filename:true
                }
            }
        )

        if (filedetails)
        {
             return Response.json(
                {
                    filedetails
                } ,
                {
                  status:200
                }
             )
        }

        else 
        {
            return Response.json(
                {
                    message:"No file data found. Please  upload files"
                } ,
                {
                  status:400
                }
             )
        }


    }

    catch(e:any)
    {
 
    }
   

    
}