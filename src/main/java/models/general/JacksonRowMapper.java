package models.general;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
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
            int columnCount = metaData.getColumnCount();

            for (int i = 1; i <= columnCount; i++) {
                String columnName = metaData.getColumnLabel(i); // getColumnLabel respects AS aliases
                Object columnValue = rs.getObject(i);
                rowMap.put(columnName, columnValue);
            }

            // Convert Map -> POJO
            return mapper.convertValue(rowMap, javaType);

        } catch (Exception e) {
            throw new SQLException("Failed to map row to " + javaType.getRawClass().getName(), e);
        }
    }
}
