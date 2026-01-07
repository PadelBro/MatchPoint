package models.general;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.postgresql.util.PGobject;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class JacksonRowMapper<T> implements RowMapper<T> {

    private final JavaType javaType;
    private final ObjectMapper mapper;

    public JacksonRowMapper(Class<T> mappedClass, ObjectMapper mapper) {
        this.javaType = mapper.getTypeFactory().constructType(mappedClass);
        this.mapper = mapper;
    }

    @Override
    public T mapRow(ResultSet rs, int rowNum) throws SQLException {
        try {
            Map<String, Object> rowMap = new HashMap<>();
            ResultSetMetaData metaData = rs.getMetaData();

            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String columnName = metaData.getColumnLabel(i);
                Object value = rs.getObject(i);

                if (value instanceof PGobject pg) {
                    if ("json".equals(pg.getType()) || "jsonb".equals(pg.getType())) {
                        value = parseJson(pg.getValue());
                    }
                }

                else if (value instanceof String str && looksLikeJson(str)) {
                    value = parseJson(str);
                }

                rowMap.put(columnName, value);
            }

            return mapper.convertValue(rowMap, javaType);

        } catch (Exception e) {
            throw new SQLException(
                    "Failed to map row to " + javaType.getRawClass().getName(),
                    e
            );
        }
    }

    private Object parseJson(String json) throws Exception {
        JsonNode node = mapper.readTree(json);
        return node.isArray() || node.isObject() ? node : json;
    }

    private boolean looksLikeJson(String value) {
        String trimmed = value.trim();
        return trimmed.startsWith("{") || trimmed.startsWith("[");
    }
}
