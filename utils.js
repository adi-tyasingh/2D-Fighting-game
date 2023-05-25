function rectCollision({rect1, rect2})
{ return(
    rect1.attackBox.position.x+rect1.attackBox.width > rect2.position.x &&
    rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
    rect1.attackBox.position.y<= rect2.position.y + rect2.height
)
}
function determineWinner({rect1,rect2,timerID})
{

    if(rect1.health==rect2.health)
    {
        document.querySelector('#winner').innerHTML='tie' ;
    }
    else if(rect1.health>rect2.health)
    {
        document.querySelector('#winner').innerHTML='player 1 wins' ;
        clearTimeout(timerID)
    }
    else  
    {
        document.querySelector('#winner').innerHTML='player 2 wins' ;
        clearTimeout(timerID)
    }
}
function rectifyPosition(rect1)
{
    
    if(rect1.position.y<80)
    {
        rect1.velocity.y=5;
    }
    if(rect1.position.x<=0)
    {
       rect1.velocity.x=1;
    }
    if(rect1.position.x+rect1.width>=canvas.width)
    {
        rect1.velocity.x=-1;
    }
}