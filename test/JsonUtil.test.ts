import {JsonUtil} from "../src/utils/JsonUtil";

describe('SQL로그가 정상적으로 json으로 파싱된다', () => {
    it('unnamed 일 경우', () => {
        const message = "2021-07-02 07:42:04 UTC:121.135.139.43(54931):inflab@antman:[3298]:LOG:  duration: 4020.000 ms  execute <unnamed>: select pg_sleep(4)";

        const result = JsonUtil.toJson(message);

        expect(result.query).toBe("select pg_sleep(4)");
    });

    it('statement 일 경우', () => {
        const message = "2021-07-02 07:33:37 UTC:121.135.139.43(62170):inflab@antman:[9955]:LOG:  duration: 3048.651 ms  statement:    select * from courses where deleted_at is null and status in ('publish', 'pause')";

        const result = JsonUtil.toJson(message);

        expect(result.query).toBe("select * from courses where deleted_at is null and status in ('publish', 'pause')");
    });
});
