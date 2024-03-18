import nodeFetch from 'node-fetch';

const newFetch = typeof fetch === 'undefined' ? nodeFetch : fetch;


export default newFetch