// place files you want to import through the `$lib` alias in this folder.

export function removeSameElementFromSet(originalSet, toBeRemovedSet) {
    [...toBeRemovedSet].forEach(function (v) {
        originalSet.delete(v);
    });
}