import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import { bugsRequestFailled, assignBugToUser, addBug, resolveBug, getUnresolvedBugs, loadBugs } from "../bugs"
import configureStore from '../configureStore';


describe("bugsSlice", () => {
  let fakeAxios;
  let store

  beforeEach(() => {
    fakeAxios = new MockAdapter(axios)
    store = configureStore()
  })

  const createState = () => ({
    entities: {
      bugs: {
        list: []
      }
    }
  })

  const bugsSlice = () => store.getState().entities.bugs

  describe("loading bugs", () => {
    describe("if the bugs exist in the cache", () => {
      it("they should not be fetched from the server again.", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs());
        await store.dispatch(loadBugs());

        expect(fakeAxios.history.get.length).toBe(1);
      });
    });

    describe("if the bugs don't exist in the cache", () => {
      it("they should be fetched from the server and put in the store", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs());

        expect(bugsSlice().list).toHaveLength(1);
      })
    })

    describe("loading indicator", () => {
      it("should be true while fetching", () => {
        fakeAxios.onGet("/bugs").reply(() => {
          expect(bugsSlice().loading).toBe(true)
          return [200, { id: 1 }]
        })

        store.dispatch(loadBugs())
      })

      it("should be false after bugs are fetched", async () => {
        fakeAxios.onGet(200, [{id: 1}])

        await store.dispatch(loadBugs())

        expect(bugsSlice().loading).toBe(false)
      })

      it("should be false when the server fails", async () => {
        fakeAxios.onGet("/bugs").reply(500)

        await store.dispatch(bugsRequestFailled())

        expect(bugsSlice().loading).toBe(false)
      })
    })
  })

  it("should assign a bug to a user if the bug userId is saved to the server", async () => {
    fakeAxios.onPatch("/bugs/1").reply(200, {id: 1, userId: 1})
    fakeAxios.onPost("/bugs").reply(200, { id: 1})

    await store.dispatch(addBug({}))
    await store.dispatch(assignBugToUser(1, 1))

    expect(bugsSlice().list[0].userId).toBe(1)
  })

  it("should add the bug to the store if it's saved to the server", async () => {
    const bug = { description: "a" };
    const savedBug = { ...bug, id: 1 };
    fakeAxios.onPost("/bugs").reply(200, savedBug);

    await store.dispatch(addBug(bug));

    expect(bugsSlice().list).toContainEqual(savedBug);
  });

  it("should not add the bug to the store if it's not saved to the server", async () => {
    const bug = { description: "a" };
    fakeAxios.onPost("/bugs").reply(500);

    await store.dispatch(addBug(bug));

    expect(bugsSlice().list).toHaveLength(0);
  });

  it("should mark the bug as resolved if it's resolved and saved to the server", async () => {
    fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, resolved: true });
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });

    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    expect(bugsSlice().list[0].resolved).toBe(true);
  })

  it("should not mark the bug as resolved if it's not resolved and saved to the server", async () => {
    fakeAxios.onPatch("/bugs/1").reply(500);
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });

    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    expect(bugsSlice().list[0].resolved).not.toBe(true);
  })

  describe("selectors", () => {
    it("should return the unresolved bugs from the server", async () => {
      let state = createState()
      state.entities.bugs.list = [{ id: 1 }, { id: 2 }, { id: 3, resolved: true }]

      const results = getUnresolvedBugs(state)

      expect(results).toHaveLength(2)
    })
  })
})


