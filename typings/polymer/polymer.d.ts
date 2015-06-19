declare module polymer {
  /** Used to define a property on a Polymer element. */
  interface IProperty<T> {
    /** Constructor, one of `Boolean`, `Date`, `Number`, `String`, `Array`, or `Object`. */
    type: Function;
    /**
     * Provides a default value for an element's property.
     *
     * This value is set on the element's prototype which means that it will be shared by all
     * instances of a particular element type. If this value is a function then Polymer will call
     * it for each element instance and set the corresponding property's default value to the
     * value returned by the function.
     */
    value?: T | {(): T};
    reflectToAttribute?: boolean;
    readOnly?: boolean;
    notify?: boolean;
    computed?: string;
    observer?: string;
  }

  /** Used to define a Polymer behavior mixin. */
  interface IBehavior {
    properties?: Object;
    observers?: string[];
    listeners?: Object;
    hostAttributes?: Object;
    behaviors?: IBehavior[];

    // Element Lifecycle
    // These callbacks are called on the base prototype first, and then on each behavior in the
    // element's behaviors array (in ascending order).

    /**
     * Called after all elements have been configured, but propagates bottom-up.
     * This element's children are ready, but parents are not.
     *
     * This callback can modify the DOM if needed.
     */
    ready?: () => void;
    /**
     * Called after the element and its parents have been inserted into a document.
     *
     * This callback can perform any work related to the element's visual state or active behavior
     * (measuring sizes, beginning animations, loading resources, etc).
     */
    attached?: () => void;
    /**
     * Called after the element has been removed from a document.
     *
     * This callback should clean up whatever was done in [[attached]].
     */
    detached?: () => void;
  }

  /** Used to define a Polymer element prototype. */
  interface IElement extends IBehavior {
    is: string;
  }

  interface Base extends HTMLElement {
    /**
     * Returns a map of statically created nodes in the local DOM.
     * Any node specified in the element's template with an `id` is stored in the auto-generated
     * map, e.g. a node with an `id` of `name` can be retrived via `this.$.name`.
     */
    $: HTMLElement;

    // Property metadata functions

    /**
     * Returns the Polymer property definition for the given property.
     * Note that if a matching property is not found in the element prototype itself the search
     * will continue onto the element's behaviors.
     */
    getPropertyInfo(propertyKey: string): IProperty<any>;
    /** Returns the native element prototype for the given HTML tag. */
    getNativePrototype(htmlTag: string): any; // static

    // Utility functions

    /**
     * Returns the first element within the local DOM scope that matches the specified group of
     * selectors.
     *
     * @param selector A CSS selector.
     */
    $$(selector: string): HTMLElement;
    /**
     * Toggles a CSS class on/off.
     * @param node The node to toggle the CSS class on, defaults to `this`.
     */
    toggleClass(cssClass: string, bool: boolean, node?: HTMLElement): void;
    /**
     * Toggles an attribute on/off.
     * @param node The node to toggle the attribute on, defaults to `this`.
     */
    toggleAttribute(attrName: string, bool: boolean, node?: HTMLElement): void;
    /** Removes a CSS class from one node and adds it to another. */
    classFollows(cssClass: string, toElement: HTMLElement, fromElement: HTMLElement): void; // static
    /** Removes an attribute from one node and adds it to another. */
    attributeFollows(attrName: string, toElement: HTMLElement, fromElement: HTMLElement): void; // static
    /**
     * Returns an array of child nodes distributed to this element's `<content>`.
     * If the element has multiple `<content>` nodes provide a CSS selector to pick the right one.
     *
     * @param selector CSS selector that should match a `<content>` node, defaults to `content`.
     */
    getContentChildNodes(selector: string): HTMLElement[];
    /**
     * Returns an array of child elements distributed to this element's `<content>`.
     * If the element has multiple `<content>` nodes provide a CSS selector to pick the right one.
     * NOTE: Unlike [[getContentChildNodes]] this function will only return elements.
     *
     * @param selector CSS selector that should match a `<content>` node, defaults to `content`.
     */
    getContentChildren(selector: string): HTMLElement[];
    /** Dispatches a custom event. */
    fire(
      type: string, detail?: Object,
      options?: { node: HTMLElement, bubbles: boolean, cancelable: boolean }
    ): CustomEvent;
    /** Runs a callback function asyncronously. */
    async(callback: Function, waitTime: number): number;
    /** Cancels an async callback started via [[async]]. */
    cancelAsync(handle: number): void;
    /** Sets an element's CSS `transform` property in a cross-platform manner. */
    transform(transform: string, node?: HTMLElement): void;
    /** Sets an element's CSS `translate3d` property in a cross-platform manner. */
    translate3d(x: number, y: number, z: number, node?: HTMLElement): void;
    /** Imports an HTML document. */
    importHref(href: string, onload: Function, onerror: Function): HTMLLinkElement;
    /** Creates and configures an element with the given properties. */
    create(tag: string, props: Object): HTMLElement;
  }

  interface ClassList {
    add(...token: string[]): void;
    remove(...token: string[]): void;
    toggle(token: string, force?: boolean): boolean;
  }

  interface DomApi {
    appendChild(node: HTMLElement): HTMLElement;
    insertBefore(node: HTMLElement): HTMLElement;
    removeChild(node: HTMLElement): HTMLElement;
    flush(): void;

    // Parent and child API

    childNodes: HTMLElement[]; // read-only
    /** Child nodes that are elements. */
    children: HTMLElement[]; // read-only
    parentNode: HTMLElement; // read-only
    firstChild: HTMLElement; // read-only
    lastChild: HTMLElement; // read-only
    firstElementChild: HTMLElement; // read-only
    lastElementChild: HTMLElement; // read-only
    previousSibling: HTMLElement; // read-only
    nextSibling: HTMLElement; // read-only
    textContent: string;
    innerHTML: string;

    // Query selector API

    /** Returns the first node matching the given CSS selector. */
    querySelector(selector: string): HTMLElement;
    querySelectorAll(selector: string): HTMLElement[];

    // Content API

    getDistributedNodes: HTMLElement[];
    getDestinationInsertionPoints: HTMLElement[];

    // Node mutation API

    setAttribute(attrName: string, value: any): void;
    removeAttribute(attrName: string): void;
    classList: ClassList;
  }

  /** Normalized event that provides equivalent target data on both shady DOM and shadow DOM. */
  interface EventApi {
    /**
     * Original or root target before shadow retargeting
     * (equivalent to event.path[0] under shadow DOM or event.target under shady DOM).
     */
    rootTarget: HTMLElement;
    /** Retargeted event target (equivalent to event.target under shadow DOM). */
    localTarget: HTMLElement;
    /** Array of nodes through which event will pass (equivalent to event.path under shadow DOM). */
    path: HTMLElement[];
  }

  interface DomApi_Static {
    (node: HTMLElement): DomApi;
    (node: Event): EventApi;
    flush(): void;
  }
}

declare var Polymer: {
  /**
   * Creates an element constructor and registers it with the document.
   *
   * @param <T> Type of element the constructor should create.
   * @returns Constructor that can be invoked to create a new element instance.
   */
  <T>(elementDefinition: polymer.IElement): T;
  /**
   * Creates an element constructor but doesn't register it with the document.
   * Use `document.registerElement` to register the new element constructor.
   *
   * @param <T> Type of element the constructor should create.
   * @returns Constructor that can be invoked to create a new element instance.
   */
  Class<T>(elementDefinition: polymer.IElement): T;

  dom: polymer.DomApi_Static;
  Base: polymer.Base;
}
