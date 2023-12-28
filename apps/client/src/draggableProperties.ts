let offsetX: number = 0,
    offsetY: number = 0,
    isDragging: boolean = false;

const draggableElement: HTMLElement = document.getElementById(
    "local-video"
) as HTMLElement;

export function handleMouseDown(event: MouseEvent | TouchEvent) {
    isDragging = true;
    offsetX =
        event instanceof MouseEvent
            ? event.clientX - draggableElement.getBoundingClientRect().left
            : event.touches[0].clientX -
            draggableElement.getBoundingClientRect().left;
    offsetY =
        event instanceof MouseEvent
            ? event.clientY - draggableElement.getBoundingClientRect().top
            : event.touches[0].clientY - draggableElement.getBoundingClientRect().top;
    if (event instanceof MouseEvent) {
        event.preventDefault();
    }
}

export function handleMouseMove(event: MouseEvent | TouchEvent) {

    if (isDragging) {
        const x =
            event instanceof MouseEvent
                ? event.clientX - offsetX
                : event.touches[0].clientX - offsetX;
        const y =
            event instanceof MouseEvent
                ? event.clientY - offsetY
                : event.touches[0].clientY - offsetY;
        console.log(x, y)
        draggableElement.style.left = x + "px";
        draggableElement.style.top = y + "px";
    }
}

export function handleMouseUp() {
    isDragging = false;
}
