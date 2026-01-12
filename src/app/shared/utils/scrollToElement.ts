export const ScrollToElementUtil = (element: HTMLElement, focus: boolean = false): void => {
    if (!element) {
        return;
    }

    setTimeout(() => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        });
        if(focus){
            element.focus()
        }
    }, 0);
};
