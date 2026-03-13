import "@testing-library/jest-dom";

class ResizeObserverMock {
	observe() {
		return;
	}

	unobserve() {
		return;
	}

	disconnect() {
		return;
	}
}

Object.defineProperty(globalThis, "ResizeObserver", {
	configurable: true,
	writable: true,
	value: ResizeObserverMock,
});
