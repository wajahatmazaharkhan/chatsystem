export const calculateGroups=(students)=>{

const groups=[];

for(let i=0;i<students;i+=7){

    groups.push({

    group : `Group ${groups.length+1}`,
    count : Math.min(7,students-i)

    })

}

    return groups

}