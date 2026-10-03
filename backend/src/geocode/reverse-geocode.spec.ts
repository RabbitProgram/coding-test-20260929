import { pickAddress, type GeocodeResult } from './reverse-geocode.js';

const result = (types: string[], formatted_address: string): GeocodeResult => ({
  types,
  formatted_address,
});

describe('pickAddress', () => {
  // 実際の、東京駅付近の返り値の並び（細かい順）
  const tokyo = [
    result(
      ['establishment', 'transit_station'],
      '日本、〒100-0005 東京都千代田区丸の内１丁目９ 東京駅',
    ),
    result(
      ['street_address'],
      '日本、〒100-0005 東京都千代田区丸の内１丁目９−３',
    ),
    result(['plus_code'], 'MQJ8+FR 日本、東京都千代田区'),
    result(
      ['sublocality_level_4'],
      '日本、〒100-0005 東京都千代田区丸の内１丁目９',
    ),
    result(
      ['sublocality_level_3'],
      '日本、〒100-0005 東京都千代田区丸の内１丁目',
    ),
    result(['sublocality_level_2'], '日本、〒100-0005 東京都千代田区丸の内'),
    result(['locality'], '日本、東京都千代田区'),
    result(['administrative_area_level_1'], '日本、東京都'),
  ];

  it('番地・建物名は出さず、丁目までにする（国名と郵便番号も省く）', () => {
    expect(pickAddress(tokyo)).toBe('東京都千代田区丸の内１丁目');
  });

  it('丁目がなければ、町名にする', () => {
    const withoutChome = tokyo.filter(
      (r) => !r.types.includes('sublocality_level_3'),
    );
    expect(pickAddress(withoutChome)).toBe('東京都千代田区丸の内');
  });

  it('町名もなければ、市区、都道府県の順に粗くする', () => {
    expect(
      pickAddress([
        result(['locality'], '日本、東京都千代田区'),
        result(['administrative_area_level_1'], '日本、東京都'),
      ]),
    ).toBe('東京都千代田区');
    expect(
      pickAddress([result(['administrative_area_level_1'], '日本、東京都')]),
    ).toBe('東京都');
  });

  it('住所の粒度がない結果（Plus Code・国だけ）は使わない', () => {
    expect(
      pickAddress([
        result(['plus_code'], 'MQJ8+FR'),
        result(['country'], '日本'),
      ]),
    ).toBeNull();
  });

  it('結果がなければ null', () => {
    expect(pickAddress([])).toBeNull();
  });
});
