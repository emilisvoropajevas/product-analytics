import { useEffect, type RefObject} from "react"

export default function useClickAway(ref: RefObject<HTMLElement | null>[], onClickAway: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedInsideAny = ref.some(
                (ref) => ref.current && ref.current.contains(target)
            );
            if (!clickedInsideAny) {
                onClickAway();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onClickAway]);
}